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

    console.log('Sending client WhatsApp notification for booking:', bookingId)

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

    // Determine client phone number
    let clientPhone = null
    if (guestInfo && guestInfo.guest_phone) {
      clientPhone = guestInfo.guest_phone
    }

    if (!clientPhone) {
      console.log('No client phone number available, skipping client WhatsApp notification')
      console.log('Booking details:', {
        booking_id: bookingId,
        guest_info: guestInfo,
        client_phone: clientPhone
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No client phone number available for WhatsApp notification',
          booking_id: bookingId
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

    // Determine client name
    const clientName = guestInfo ? guestInfo.guest_name : 'Cliente'

    // Create client WhatsApp message
    const whatsappMessage = `✅ *Reserva confirmada - ${provider.business_name}*

¡Hola ${clientName}! Tu reserva ha sido registrada exitosamente.

📋 *Detalles de tu cita:*
• Servicio: ${service.name}
• Fecha: ${bookingDate}
• Hora: ${bookingTime}
• Duración: ${service.duration_minutes} min
• Precio: $${service.price}

🏢 *Información del proveedor:*
• Negocio: ${provider.business_name}
${provider.whatsapp_phone ? `• WhatsApp: ${provider.whatsapp_phone}` : ''}

⏳ *Estado:* Pendiente de confirmación

El proveedor se pondrá en contacto contigo para confirmar la cita.

${booking.client_notes ? `*Tus notas:* ${booking.client_notes}` : ''}

_Mensaje automático de BookEasy.mx_`

    // Send WhatsApp message using Twilio
    const twilioAccountSid = Deno.env.get('twilio_account_sid')
    const twilioAuthToken = Deno.env.get('twilio_auth_token')
    const twilioWhatsAppNumber = 'whatsapp:+18777036062' // New approved number
    const templateSid = Deno.env.get('booking_confirmation')

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error('Twilio credentials missing:', {
        hasAccountSid: !!twilioAccountSid,
        hasAuthToken: !!twilioAuthToken
      })
      throw new Error('Twilio credentials not configured')
    }

    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    // Ensure client phone number has proper WhatsApp format
    let toWhatsAppNumber = clientPhone
    if (!toWhatsAppNumber.startsWith('whatsapp:')) {
      // Require full international format (no default country code)
      if (!toWhatsAppNumber.startsWith('+')) {
        console.error('Client phone number must include country code:', toWhatsAppNumber)
        throw new Error('Client phone number must include country code (e.g., +1, +52)')
      }
      toWhatsAppNumber = 'whatsapp:' + toWhatsAppNumber
    }

    console.log('Preparing to send client WhatsApp message:', {
      from: twilioWhatsAppNumber,
      to: toWhatsAppNumber,
      client_name: clientName,
      provider_business: provider.business_name,
      booking_date: bookingDate,
      booking_time: bookingTime,
      using_template: !!templateSid
    })

    let response;
    
    // Try template message first if available
    if (templateSid) {
      console.log('Attempting to send template message with SID:', templateSid)
      
      const templateVariables = JSON.stringify([
        clientName,
        service.name,
        bookingDate,
        bookingTime,
        provider.business_name
      ])

      response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: toWhatsAppNumber,
          ContentSid: templateSid,
          ContentVariables: templateVariables,
        }),
      })

      // If template fails, fall back to plain text
      if (!response.ok) {
        console.log('Template message failed, falling back to plain text')
        response = await fetch(twilioUrl, {
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
      }
    } else {
      // No template available, use plain text
      console.log('No template SID available, using plain text message')
      response = await fetch(twilioUrl, {
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
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error details for client notification:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        to: toWhatsAppNumber,
        from: twilioWhatsAppNumber
      })
      throw new Error(`Failed to send client WhatsApp message: ${response.status} - ${errorText}`)
    }

    const twilioResponse = await response.json()
    console.log('Client WhatsApp message sent successfully:', twilioResponse.sid)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client WhatsApp notification sent successfully',
        messageSid: twilioResponse.sid 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending client WhatsApp notification:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})