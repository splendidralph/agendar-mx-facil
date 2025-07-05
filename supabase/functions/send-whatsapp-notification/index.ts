
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

    // Get WhatsApp phone from notification preferences
    const { data: notificationPrefs, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('whatsapp_phone, whatsapp_enabled')
      .eq('provider_id', booking.provider_id)
      .single()

    if (prefsError) {
      console.error('Error fetching notification preferences:', prefsError)
      throw new Error('Notification preferences not found')
    }

    if (!notificationPrefs.whatsapp_enabled || !notificationPrefs.whatsapp_phone) {
      console.log('Provider has WhatsApp notifications disabled or no phone number configured')
      console.log('Provider details:', {
        provider_id: booking.provider_id,
        business_name: provider.business_name,
        whatsapp_enabled: notificationPrefs.whatsapp_enabled,
        whatsapp_phone: notificationPrefs.whatsapp_phone
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Provider has WhatsApp notifications disabled or no phone number configured',
          provider_id: booking.provider_id,
          business_name: provider.business_name
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

    // Get Message Template SIDs from environment
    const newBookingTemplateSid = Deno.env.get('WHATSAPP_NEW_BOOKING_TEMPLATE_SID')
    const bookingConfirmationTemplateSid = Deno.env.get('WHATSAPP_BOOKING_CONFIRMATION_TEMPLATE_SID')

    // Prepare message data for template or fallback
    const templateVariables = [
      provider.business_name,
      service.name,
      bookingDate,
      bookingTime,
      service.duration_minutes.toString(),
      service.price.toString(),
      clientName,
      clientPhone,
      booking.client_notes || 'Sin notas adicionales'
    ]

    // Fallback message for when templates aren't available
    const fallbackMessage = `🗓️ *Nueva reserva para ${provider.business_name}*

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

Para confirmar la reserva, contacta al ${clientPhone}.

_Mensaje automático de BookEasy.mx_`

    // Send WhatsApp message using Twilio
    const twilioAccountSid = Deno.env.get('twilio_account_sid')
    const twilioAuthToken = Deno.env.get('twilio_auth_token')
    const twilioWhatsAppNumber = 'whatsapp:+18777036062' // New approved number

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error('Twilio credentials missing:', {
        hasAccountSid: !!twilioAccountSid,
        hasAuthToken: !!twilioAuthToken
      })
      throw new Error('Twilio credentials not configured')
    }

    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`

    // Ensure phone number has proper WhatsApp format
    let toWhatsAppNumber = notificationPrefs.whatsapp_phone
    if (!toWhatsAppNumber.startsWith('whatsapp:')) {
      // Require full international format (no default country code)
      if (!toWhatsAppNumber.startsWith('+')) {
        console.error('WhatsApp phone number must include country code:', toWhatsAppNumber)
        throw new Error('Provider WhatsApp phone number must include country code (e.g., +1, +52)')
      }
      toWhatsAppNumber = 'whatsapp:' + toWhatsAppNumber
    }

    // Prepare message body parameters
    let messageBody = {}
    let useTemplate = false

    // Try to use Message Template if available
    if (newBookingTemplateSid) {
      console.log('Using WhatsApp Message Template:', newBookingTemplateSid)
      messageBody = {
        From: twilioWhatsAppNumber,
        To: toWhatsAppNumber,
        ContentSid: newBookingTemplateSid,
        ContentVariables: JSON.stringify({
          "1": provider.business_name,
          "2": service.name,
          "3": bookingDate,
          "4": bookingTime,
          "5": service.duration_minutes.toString() + " min",
          "6": "$" + service.price.toString(),
          "7": clientName,
          "8": clientPhone,
          "9": booking.client_notes || 'Sin notas adicionales'
        })
      }
      useTemplate = true
    } else {
      console.log('Using fallback freeform message (templates not configured)')
      messageBody = {
        From: twilioWhatsAppNumber,
        To: toWhatsAppNumber,
        Body: fallbackMessage
      }
    }

    console.log('Preparing to send WhatsApp message:', {
      from: twilioWhatsAppNumber,
      to: toWhatsAppNumber,
      provider_business: provider.business_name,
      client_name: clientName,
      booking_date: bookingDate,
      booking_time: bookingTime,
      using_template: useTemplate,
      template_sid: useTemplate ? newBookingTemplateSid : 'N/A'
    })

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(messageBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twilio API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        to: toWhatsAppNumber,
        from: twilioWhatsAppNumber
      })
      throw new Error(`Failed to send WhatsApp message: ${response.status} - ${errorText}`)
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
