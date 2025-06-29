
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

    const { bookingId } = await req.json()

    console.log('Sending WhatsApp notification for booking:', bookingId)

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

    // Check if provider has WhatsApp phone number
    if (!provider.whatsapp_phone) {
      console.log('Provider has no WhatsApp phone number, skipping WhatsApp notification')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Provider has no WhatsApp phone number configured' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

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

    // Create WhatsApp message
    const whatsappMessage = `🗓️ *Nueva reserva para ${provider.business_name}*

📋 *Detalles:*
• Servicio: ${service.name}
• Fecha: ${bookingDate}
• Hora: ${bookingTime}
• Duración: ${service.duration_minutes} min
• Precio: $${service.price}

👤 *Cliente:*
• Nombre: ${clientName}
• Teléfono: ${clientPhone}
${booking.client_notes ? `• Notas: ${booking.client_notes}` : ''}

⏳ Estado: Pendiente de confirmación

Para confirmar la reserva, contacta al cliente al ${clientPhone}.

_Mensaje automático de BookEasy.mx_`

    // Send WhatsApp message using Twilio
    const twilioAccountSid = Deno.env.get('twilio_account_sid')
    const twilioAuthToken = Deno.env.get('twilio_auth_token')
    const twilioWhatsAppNumber = 'whatsapp:+14155238886' // Sandbox number

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio credentials not configured')
    }

    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    // Ensure phone number has proper WhatsApp format
    let toWhatsAppNumber = provider.whatsapp_phone
    if (!toWhatsAppNumber.startsWith('whatsapp:')) {
      // Add country code if not present (default to Mexico +52)
      if (!toWhatsAppNumber.startsWith('+')) {
        toWhatsAppNumber = '+52' + toWhatsAppNumber.replace(/^0+/, '')
      }
      toWhatsAppNumber = 'whatsapp:' + toWhatsAppNumber
    }

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioWhatsAppNumber,
        To: toWhatsAppNumber,
        Body: whatsappMessage,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error:', errorText)
      throw new Error(`Failed to send WhatsApp message: ${response.status}`)
    }

    const twilioResponse = await response.json()
    console.log('WhatsApp message sent successfully:', twilioResponse.sid)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notification sent successfully',
        messageSid: twilioResponse.sid 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
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
