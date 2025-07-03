
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      providerId, 
      serviceId, 
      bookingDate, 
      bookingTime, 
      clientData,
      isGuest = true 
    } = await req.json()

    console.log('Creating booking with data:', { 
      providerId, 
      serviceId, 
      bookingDate, 
      bookingTime, 
      clientData: { ...clientData, phone: clientData?.phone ? 'provided' : 'missing' },
      isGuest 
    })

    // Enhanced validation for required fields
    if (!providerId || !serviceId || !bookingDate || !bookingTime) {
      console.error('Missing required booking fields')
      await supabase.rpc('log_security_event', {
        event_type: 'booking_creation_failed',
        event_data: { reason: 'missing_fields', providerId, serviceId }
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required booking information' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate booking date is not in the past
    const today = new Date().toISOString().split('T')[0]
    if (bookingDate < today) {
      console.error('Booking date is in the past')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot book appointments in the past' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate booking time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(bookingTime)) {
      console.error('Invalid booking time format')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid time format' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (isGuest && (!clientData?.name || !clientData?.phone)) {
      console.error('Missing required guest information')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Name and phone are required for guest bookings' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Validate guest data format if provided
    if (isGuest && clientData) {
      if (clientData.name && (clientData.name.length < 2 || clientData.name.length > 100)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid name length' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const phoneRegex = /^\+?[1-9]\d{1,14}$/
      if (clientData.phone && !phoneRegex.test(clientData.phone)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid phone number format' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
      if (clientData.email && !emailRegex.test(clientData.email)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid email format' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    }

    // Get the service details and verify it belongs to provider
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('price, duration_minutes, provider_id')
      .eq('id', serviceId)
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .single()

    if (serviceError) {
      console.error('Service fetch error:', serviceError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Service not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    let clientId = null

    if (!isGuest) {
      // For authenticated users, get the user ID from the auth header
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)
        if (!userError && user) {
          clientId = user.id
        }
      }
    }

    // Check for booking conflicts
    const { data: conflictCheck, error: conflictError } = await supabase
      .rpc('check_booking_conflicts', {
        provider_id_param: providerId,
        service_id_param: serviceId,
        booking_date_param: bookingDate,
        booking_time_param: bookingTime,
        duration_minutes_param: service.duration_minutes
      })

    if (conflictError) {
      console.error('Error checking booking conflicts:', conflictError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to verify booking availability' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    if (!conflictCheck) {
      console.log('Booking time conflict detected')
      await supabase.rpc('log_security_event', {
        event_type: 'booking_conflict_attempt',
        event_data: { providerId, serviceId, bookingDate, bookingTime }
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'This time slot is no longer available' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409 
        }
      )
    }

    console.log('Creating booking record with clientId:', clientId)

    // Create the booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_id: providerId,
        service_id: serviceId,
        client_id: clientId, // This can now be null for guest bookings
        booking_date: bookingDate,
        booking_time: bookingTime,
        total_price: service.price,
        status: 'pending',
        source_type: 'web',
        client_notes: clientData?.notes || null
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create booking. Please try again.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Booking created successfully:', booking.id)

    // If it's a guest booking, create the guest booking details
    if (isGuest && clientData) {
      console.log('Creating guest booking details')
      const { error: guestError } = await supabase
        .from('guest_bookings')
        .insert({
          booking_id: booking.id,
          guest_name: clientData.name,
          guest_phone: clientData.phone,
          guest_email: clientData.email || null
        })

      if (guestError) {
        console.error('Guest booking details error:', guestError)
        // Continue anyway as the main booking was created
      } else {
        console.log('Guest booking details created successfully')
      }
    }

    // Get provider notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('provider_id', providerId)
      .single()

    // Default to both email and WhatsApp if no preferences found
    const shouldSendEmail = !preferences || preferences.email_enabled
    const shouldSendWhatsApp = !preferences || preferences.whatsapp_enabled

    console.log('Notification preferences:', { shouldSendEmail, shouldSendWhatsApp })

    // Send notifications based on preferences
    const notificationPromises = []

    if (shouldSendEmail) {
      console.log('Queuing email notification...')
      notificationPromises.push(
        supabase.functions.invoke('send-booking-notification', {
          body: { bookingId: booking.id }
        }).then(result => ({ type: 'email', result })).catch(error => ({ type: 'email', error }))
      )
    }

    if (shouldSendWhatsApp) {
      console.log('Queuing WhatsApp notification...')
      notificationPromises.push(
        supabase.functions.invoke('send-whatsapp-notification', {
          body: { bookingId: booking.id }
        }).then(result => ({ type: 'whatsapp', result })).catch(error => ({ type: 'whatsapp', error }))
      )
    }

    // Send notifications and handle results
    if (notificationPromises.length > 0) {
      try {
        const results = await Promise.allSettled(notificationPromises)
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const { type, result: notificationResult, error } = result.value
            if (error) {
              console.error(`Error sending ${type} notification:`, error)
            } else if (notificationResult?.error) {
              console.error(`Error sending ${type} notification:`, notificationResult.error)
            } else {
              console.log(`${type} notification sent successfully`)
            }
          } else {
            console.error('Notification promise rejected:', result.reason)
          }
        })
      } catch (error) {
        console.error('Error sending notifications:', error)
        // Don't fail the booking creation if notifications fail
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookingId: booking.id,
        message: 'Booking created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Unexpected error creating booking:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
