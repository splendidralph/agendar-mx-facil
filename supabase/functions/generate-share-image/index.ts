import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate QR Code using QR Server API (PNG format)
async function generateQRCodeBase64(text: string, size: number = 200): Promise<string> {
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=0`;
    const response = await fetch(qrApiUrl);
    
    if (!response.ok) {
      throw new Error(`QR API failed: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('QR generation failed:', error);
    // Return a simple fallback data URL
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <rect width="25" height="25" fill="white"/>
        <g fill="black">
          <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="white"/>
          <rect x="2" y="2" width="3" height="3"/><rect x="18" y="0" width="7" height="7"/>
          <rect x="19" y="1" width="5" height="5" fill="white"/><rect x="20" y="2" width="3" height="3"/>
          <rect x="0" y="18" width="7" height="7"/><rect x="1" y="19" width="5" height="5" fill="white"/>
          <rect x="2" y="20" width="3" height="3"/><rect x="10" y="10" width="5" height="5"/>
        </g>
      </svg>
    `);
  }
}

// Convert SVG to Canvas and then to JPEG
async function svgToJpeg(svgString: string, width: number, height: number): Promise<string> {
  // For server-side conversion, we'll return the SVG as base64 for now
  // and handle the conversion on the client side if needed
  const encoder = new TextEncoder();
  const svgBytes = encoder.encode(svgString);
  const svgBase64 = btoa(String.fromCharCode(...svgBytes));
  return `data:image/svg+xml;base64,${svgBase64}`;
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

    // Generate QR code as base64 PNG
    const bookingUrl = `https://bookeasy.mx/${provider.username}`;
    const qrCodeBase64 = await generateQRCodeBase64(bookingUrl, 200);

    // Create modern SVG inspired by CashApp design
    const svg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="16" flood-opacity="0.3"/>
          </filter>
          <clipPath id="profileClip">
            <circle cx="0" cy="0" r="80"/>
          </clipPath>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Dark Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- Main content container -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 300 : 200})">
          <!-- Profile section -->
          ${profileImageBase64 ? `
            <circle cx="0" cy="0" r="85" fill="white" filter="url(#shadow)"/>
            <image x="-80" y="-80" width="160" height="160" 
                   href="data:image/jpeg;base64,${profileImageBase64}" 
                   clip-path="url(#profileClip)" 
                   preserveAspectRatio="xMidYMid slice"/>
          ` : `
            <circle cx="0" cy="0" r="85" fill="url(#accentGradient)" filter="url(#shadow)"/>
            <text x="0" y="20" text-anchor="middle" 
                  font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                  font-size="64" 
                  font-weight="600" 
                  fill="white">
              ${(provider.business_name || 'Usuario').charAt(0).toUpperCase()}
            </text>
          `}
          
          <!-- Business name -->
          <text x="0" y="150" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="42" 
                font-weight="700" 
                fill="white">
            ${provider.business_name || 'Mi Negocio'}
          </text>
          
          <!-- Username handle -->
          <text x="0" y="190" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="24" 
                fill="#999" 
                font-weight="400">
            @${provider.username}
          </text>
          
          <!-- Category tag -->
          <rect x="-100" y="220" width="200" height="36" 
                rx="18" fill="rgba(102, 126, 234, 0.2)" stroke="rgba(102, 126, 234, 0.4)" stroke-width="1"/>
          <text x="0" y="242" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="16" 
                fill="#667eea" 
                font-weight="500">
            ${provider.category || 'Servicios Profesionales'}
          </text>
        </g>
        
        <!-- QR Code Section -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 700 : 450})">
          <!-- QR Background -->
          <rect x="-140" y="-140" width="280" height="280" 
                fill="white" rx="24" filter="url(#shadow)"/>
          
          <!-- QR Code -->
          <image x="-100" y="-100" width="200" height="200" 
                 href="${qrCodeBase64}" 
                 preserveAspectRatio="xMidYMid meet"/>
          
          <!-- BookEasy logo in center -->
          <circle cx="0" cy="0" r="20" fill="url(#accentGradient)"/>
          <text x="0" y="6" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="18" 
                font-weight="bold" 
                fill="white">
            B
          </text>
        </g>
        
        <!-- Call to action -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 1050 : 750})">
          <text x="0" y="0" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="28" 
                fill="white" 
                font-weight="600">
            Escanea para reservar tu cita
          </text>
          
          <!-- URL -->
          <text x="0" y="40" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="20" 
                fill="#999" 
                font-weight="400">
            bookeasy.mx/${provider.username}
          </text>
        </g>
        
        <!-- BookEasy branding -->
        <g transform="translate(${dimensions.width/2}, ${dimensions.height - 60})">
          <text x="0" y="0" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="16" 
                font-weight="500" 
                fill="#666">
            Powered by BookEasy.mx
          </text>
        </g>
      </svg>
    `;

    // Convert SVG to base64 data URL
    const finalImageUrl = await svgToJpeg(svg, dimensions.width, dimensions.height);

    console.log('Generated image for provider:', provider.username);
    console.log('SVG size:', svg.length, 'characters');

    return new Response(
      JSON.stringify({ 
        image: finalImageUrl,
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