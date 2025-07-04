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

    const { bookingId, webhookUrl } = await req.json()

    console.log('Sending HighLevel webhook for booking:', bookingId)

    if (!webhookUrl) {
      throw new Error('Webhook URL is required')
    }

    // Get booking details with provider and service information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        providers!inner(
          business_name, 
          whatsapp_phone,
          user_id, 
          users!inner(email, full_name)
        ),
        services!inner(name, price, duration_minutes),
        guest_bookings(guest_name, guest_phone, guest_email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError) {
      console.error('Error fetching booking:', bookingError)
      throw new Error('Booking not found')
    }

    const provider = booking.providers
    const service = booking.services
    const guestInfo = booking.guest_bookings?.[0]

    // Format date and time
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const bookingTime = booking.booking_time

    // Determine client information
    const clientName = guestInfo ? guestInfo.guest_name : 'Cliente registrado'
    const clientPhone = guestInfo ? guestInfo.guest_phone : 'No disponible'
    const clientEmail = guestInfo ? guestInfo.guest_email || 'No proporcionado' : 'No disponible'

    // Create webhook payload for HighLevel
    const webhookPayload = {
      event_type: 'new_booking',
      booking_id: booking.id,
      timestamp: new Date().toISOString(),
      
      // Provider information
      provider: {
        business_name: provider.business_name,
        full_name: provider.users.full_name,
        email: provider.users.email,
        whatsapp_phone: provider.whatsapp_phone
      },
      
      // Client information
      client: {
        name: clientName,
        phone: clientPhone,
        email: clientEmail
      },
      
      // Booking details
      booking: {
        service_name: service.name,
        booking_date: bookingDate,
        booking_time: bookingTime,
        duration_minutes: service.duration_minutes,
        price: service.price,
        status: booking.status,
        notes: booking.client_notes || '',
        source: 'BookEasy.mx'
      },
      
      // HighLevel triggers
      triggers: {
        send_provider_notification: true,
        send_client_confirmation: true,
        create_contact: true,
        add_to_pipeline: true
      }
    }

    // Send webhook to HighLevel
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BookEasy-Webhook/1.0',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('HighLevel webhook error:', errorText)
      throw new Error(`Failed to send HighLevel webhook: ${response.status} - ${errorText}`)
    }

    const responseData = await response.text()
    console.log('HighLevel webhook sent successfully:', responseData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'HighLevel webhook sent successfully',
        webhook_response: responseData,
        payload_sent: webhookPayload
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending HighLevel webhook:', error)
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