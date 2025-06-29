
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

    console.log('Creating booking:', { providerId, serviceId, bookingDate, bookingTime, clientData, isGuest })

    // Get the service details to calculate total price
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('price')
      .eq('id', serviceId)
      .single()

    if (serviceError) {
      console.error('Service fetch error:', serviceError)
      throw new Error('Service not found')
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

    // Create the booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        provider_id: providerId,
        service_id: serviceId,
        client_id: clientId, // null for guest bookings
        booking_date: bookingDate,
        booking_time: bookingTime,
        total_price: service.price,
        status: 'pending',
        source_type: 'web',
        client_notes: clientData.notes || null
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      throw new Error('Failed to create booking')
    }

    console.log('Booking created:', booking)

    // If it's a guest booking, create the guest booking details
    if (isGuest) {
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
        // Don't throw here, booking is already created
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
    console.error('Error creating booking:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
