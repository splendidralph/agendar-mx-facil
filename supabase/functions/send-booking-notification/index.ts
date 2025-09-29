
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@4.0.0"

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

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

    console.log('Sending booking notification for booking:', bookingId)

    // Get booking details with provider, service, and guest information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        providers!inner(business_name, user_id, users!inner(email, full_name)),
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

    // Format date and time for email
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

    // Send email to provider
    const emailResponse = await resend.emails.send({
      from: "BookEasy <noreply@bookeasy.mx>",
      to: [provider.users.email],
      subject: `🗓️ Nueva reserva para ${provider.business_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Nueva Reserva Recibida</h1>
              <p>Hola ${provider.users.full_name || provider.business_name}</p>
            </div>
            
            <div class="content">
              <p>¡Tienes una nueva solicitud de reserva! Aquí están los detalles:</p>
              
              <div class="booking-details">
                <h3>📋 Detalles de la Reserva</h3>
                
                <div class="detail-row">
                  <span class="label">Servicio:</span>
                  <span class="value">${service.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Fecha:</span>
                  <span class="value">${bookingDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Hora:</span>
                  <span class="value">${bookingTime}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Duración:</span>
                  <span class="value">${service.duration_minutes} minutos</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Precio:</span>
                  <span class="value">$${service.price}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Estado:</span>
                  <span class="value">⏳ Pendiente de confirmación</span>
                </div>
              </div>
              
              <div class="booking-details">
                <h3>👤 Información del Cliente</h3>
                
                <div class="detail-row">
                  <span class="label">Nombre:</span>
                  <span class="value">${clientName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">${clientPhone}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Email:</span>
                  <span class="value">${clientEmail}</span>
                </div>
                
                ${booking.client_notes ? `
                <div class="detail-row">
                  <span class="label">Notas:</span>
                  <span class="value">${booking.client_notes}</span>
                </div>
                ` : ''}
              </div>
              
              <p><strong>📞 Próximos pasos:</strong></p>
              <ul>
                <li>Contacta al cliente para confirmar la disponibilidad</li>
                <li>Puedes llamar al ${clientPhone} o escribir un mensaje</li>
                <li>Una vez confirmado, actualiza el estado de la reserva</li>
              </ul>
              
              <div class="footer">
                <p>Esta es una notificación automática de BookEasy.mx</p>
                <p>No respondas a este email. Para soporte, contacta: soporte@bookeasy.mx</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailResponse.error) {
      console.error('Error sending email:', emailResponse.error)
      throw new Error('Failed to send notification email')
    }

    console.log('Email sent successfully:', emailResponse.data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        emailId: emailResponse.data?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending booking notification:', error)
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
