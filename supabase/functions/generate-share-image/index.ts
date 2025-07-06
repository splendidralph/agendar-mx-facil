import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// QR Code generation function
function generateQRCodeSVG(text: string, size: number = 100): string {
  // Simple QR code pattern for demonstration - in production, use a proper QR library
  const qrPattern = `
    <svg width="${size}" height="${size}" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect width="21" height="21" fill="white"/>
      <g fill="black">
        <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="white"/>
        <rect x="2" y="2" width="3" height="3"/><rect x="14" y="0" width="7" height="7"/>
        <rect x="15" y="1" width="5" height="5" fill="white"/><rect x="16" y="2" width="3" height="3"/>
        <rect x="0" y="14" width="7" height="7"/><rect x="1" y="15" width="5" height="5" fill="white"/>
        <rect x="2" y="16" width="3" height="3"/><rect x="8" y="8" width="1" height="1"/>
        <rect x="10" y="8" width="1" height="1"/><rect x="12" y="8" width="1" height="1"/>
        <rect x="8" y="10" width="1" height="1"/><rect x="10" y="10" width="1" height="1"/>
        <rect x="12" y="10" width="1" height="1"/><rect x="8" y="12" width="1" height="1"/>
        <rect x="10" y="12" width="1" height="1"/><rect x="12" y="12" width="1" height="1"/>
      </g>
    </svg>
  `;
  return qrPattern;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { providerId, format = 'story' } = await req.json()

    if (!providerId) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch provider data
    const { data: provider, error } = await supabase
      .from('providers')
      .select('business_name, username, category, profile_image_url, bio')
      .eq('id', providerId)
      .single()

    if (error || !provider) {
      console.error('Error fetching provider:', error)
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Generate image dimensions based on format
    const dimensions = format === 'story' 
      ? { width: 1080, height: 1920 } 
      : { width: 1080, height: 1080 }

    // Fetch profile image if available
    let profileImageBase64 = null;
    if (provider.profile_image_url) {
      try {
        const profileResponse = await fetch(provider.profile_image_url);
        if (profileResponse.ok) {
          const profileBuffer = await profileResponse.arrayBuffer();
          profileImageBase64 = btoa(String.fromCharCode(...new Uint8Array(profileBuffer)));
        }
      } catch (error) {
        console.log('Could not fetch profile image:', error);
      }
    }

    // Generate QR code SVG
    const bookingUrl = `https://bookeasy.mx/${provider.username}`;
    const qrCodeSVG = generateQRCodeSVG(bookingUrl, 100);

    // Create enhanced SVG with proper profile image and QR code
    const svg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="12" flood-opacity="0.25"/>
          </filter>
          <clipPath id="profileClip">
            <circle cx="0" cy="0" r="110"/>
          </clipPath>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- Main content container -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 450 : 250})">
          <!-- Profile image container -->
          <circle cx="0" cy="0" r="120" fill="white" filter="url(#shadow)"/>
          
          ${profileImageBase64 ? `
            <image x="-110" y="-110" width="220" height="220" 
                   href="data:image/jpeg;base64,${profileImageBase64}" 
                   clip-path="url(#profileClip)" 
                   preserveAspectRatio="xMidYMid slice"/>
          ` : `
            <circle cx="0" cy="0" r="110" fill="#f0f0f0"/>
            <text x="0" y="15" text-anchor="middle" 
                  font-family="Arial, sans-serif" 
                  font-size="48" 
                  font-weight="bold" 
                  fill="#999">
              ${(provider.business_name || 'Usuario').charAt(0).toUpperCase()}
            </text>
          `}
          
          <!-- Business name -->
          <text x="0" y="200" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="52" 
                font-weight="bold" 
                fill="white"
                filter="url(#shadow)">
            ${provider.business_name || 'Mi Negocio'}
          </text>
          
          <!-- Username -->
          <text x="0" y="260" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="38" 
                fill="white" 
                opacity="0.95">
            @${provider.username}
          </text>
          
          <!-- Category -->
          <text x="0" y="320" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="32" 
                fill="white" 
                opacity="0.85">
            ${provider.category || 'Servicios Profesionales'}
          </text>
          
          <!-- Call to action button -->
          <rect x="-220" y="380" width="440" height="90" 
                rx="45" fill="white" filter="url(#shadow)"/>
          <text x="0" y="440" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="36" 
                font-weight="bold" 
                fill="#667eea">
            ¡Reserva tu cita ahora!
          </text>
          
          <!-- Booking URL -->
          <text x="0" y="530" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="28" 
                fill="white" 
                opacity="0.9"
                font-weight="500">
            bookeasy.mx/${provider.username}
          </text>
        </g>
        
        <!-- BookEasy branding at bottom -->
        <g transform="translate(${dimensions.width/2}, ${dimensions.height - 120})">
          <rect x="-180" y="-35" width="360" height="70" 
                rx="35" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
          <text x="0" y="8" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="28" 
                font-weight="bold" 
                fill="white">
            BookEasy.mx
          </text>
        </g>
        
        <!-- QR Code -->
        <g transform="translate(${dimensions.width - 180}, ${dimensions.height - 200})">
          <rect x="-60" y="-60" width="120" height="120" 
                fill="white" rx="15" filter="url(#shadow)"/>
          <g transform="translate(-50, -50) scale(4.76, 4.76)">
            ${qrCodeSVG.replace('<svg width="100" height="100" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
          </g>
        </g>
      </svg>
    `;

    // Convert SVG to base64 data URL with proper encoding
    const encoder = new TextEncoder();
    const svgBytes = encoder.encode(svg);
    const svgBase64 = btoa(String.fromCharCode(...svgBytes));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    console.log('Generated image for provider:', provider.username);
    console.log('SVG size:', svg.length, 'characters');

    return new Response(
      JSON.stringify({ 
        image: dataUrl,
        format,
        provider: {
          business_name: provider.business_name,
          username: provider.username
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating share image:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate image', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})