
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

    // Validate required fields
    if (!providerId || !serviceId || !bookingDate || !bookingTime) {
      console.error('Missing required booking fields')
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

    // Get the service details to calculate total price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('price')
      .eq('id', serviceId)
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
