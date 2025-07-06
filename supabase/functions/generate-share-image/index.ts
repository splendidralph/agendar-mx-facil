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

// Convert SVG to clean data URL (no PNG conversion - done client-side)
function svgToDataUrl(svgString: string): string {
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

    // Create VIRAL modern design optimized for social sharing
    const svg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <!-- High-contrast gradient background -->
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f0f23;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
          </linearGradient>
          
          <!-- Viral accent gradient -->
          <linearGradient id="viralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#4ecdc4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#45b7d1;stop-opacity:1" />
          </linearGradient>
          
          <!-- BookEasy brand gradient -->
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          
          <!-- Success/CTA gradient -->
          <linearGradient id="ctaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#56ab2f;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a8e6cf;stop-opacity:1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="20" flood-opacity="0.4"/>
          </filter>
          
          <clipPath id="profileClip">
            <circle cx="0" cy="0" r="120"/>
          </clipPath>
        </defs>
        
        <!-- Dark Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- TOP VIRAL BANNER - "GET YOURS FREE" -->
        <g transform="translate(${dimensions.width/2}, 80)">
          <rect x="-400" y="-35" width="800" height="70" 
                fill="url(#viralGradient)" rx="35" filter="url(#glow)"/>
          <text x="0" y="12" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="36" 
                font-weight="900" 
                fill="white">
            🚀 GET YOUR FREE BOOKING PAGE
          </text>
        </g>
        
        <!-- BookEasy Prominent Branding -->
        <g transform="translate(${dimensions.width/2}, 180)">
          <text x="0" y="0" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="48" 
                font-weight="800" 
                fill="url(#brandGradient)"
                filter="url(#glow)">
            BookEasy.mx
          </text>
          <text x="0" y="35" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="24" 
                fill="#a8e6cf" 
                font-weight="600">
            Join 1000+ professionals already using BookEasy
          </text>
        </g>
        
        <!-- Main Profile Section -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 400 : 320})">
          <!-- Profile Image - BIGGER -->
          ${profileImageBase64 ? `
            <circle cx="0" cy="0" r="125" fill="white" filter="url(#shadow)"/>
            <circle cx="0" cy="0" r="120" fill="url(#viralGradient)" opacity="0.1"/>
            <image x="-120" y="-120" width="240" height="240" 
                   href="data:image/jpeg;base64,${profileImageBase64}" 
                   clip-path="url(#profileClip)" 
                   preserveAspectRatio="xMidYMid slice"/>
          ` : `
            <circle cx="0" cy="0" r="125" fill="url(#viralGradient)" filter="url(#shadow)"/>
            <text x="0" y="25" text-anchor="middle" 
                  font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                  font-size="96" 
                  font-weight="700" 
                  fill="white">
              ${(provider.business_name || 'Usuario').charAt(0).toUpperCase()}
            </text>
          `}
          
          <!-- Business Name - BIGGER -->
          <text x="0" y="200" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="56" 
                font-weight="800" 
                fill="white"
                filter="url(#glow)">
            ${provider.business_name || 'Mi Negocio'}
          </text>
          
          <!-- Username - BIGGER -->
          <text x="0" y="250" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="32" 
                fill="#4ecdc4" 
                font-weight="600">
            @${provider.username}
          </text>
          
          <!-- Category Badge - BIGGER -->
          <rect x="-150" y="280" width="300" height="50" 
                rx="25" fill="url(#ctaGradient)" filter="url(#glow)"/>
          <text x="0" y="312" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="22" 
                fill="white" 
                font-weight="700">
            ✨ ${provider.category || 'Servicios Profesionales'}
          </text>
        </g>
        
        <!-- BIGGER QR Code Section -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 800 : 550})">
          <!-- QR Background - BIGGER -->
          <rect x="-180" y="-180" width="360" height="360" 
                fill="white" rx="32" filter="url(#shadow)"/>
          <rect x="-175" y="-175" width="350" height="350" 
                fill="url(#viralGradient)" opacity="0.05" rx="28"/>
          
          <!-- QR Code - BIGGER -->
          <image x="-150" y="-150" width="300" height="300" 
                 href="${qrCodeBase64}" 
                 preserveAspectRatio="xMidYMid meet"/>
          
          <!-- BookEasy logo in center - BIGGER -->
          <circle cx="0" cy="0" r="35" fill="url(#brandGradient)" filter="url(#glow)"/>
          <text x="0" y="10" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="32" 
                font-weight="900" 
                fill="white">
            B
          </text>
        </g>
        
        <!-- BIGGER Call to Action -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 1100 : 800})">
          <text x="0" y="0" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="42" 
                fill="white" 
                font-weight="700"
                filter="url(#glow)">
            📱 SCAN TO BOOK INSTANTLY
          </text>
          
          <!-- Prominent URL -->
          <text x="0" y="50" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="28" 
                fill="#4ecdc4" 
                font-weight="600">
            bookeasy.mx/${provider.username}
          </text>
        </g>
        
        <!-- VIRAL Bottom CTA -->
        <g transform="translate(${dimensions.width/2}, ${dimensions.height - 120})">
          <rect x="-350" y="-25" width="700" height="50" 
                fill="url(#ctaGradient)" rx="25" filter="url(#glow)"/>
          <text x="0" y="5" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="28" 
                font-weight="800" 
                fill="white">
            🔥 CLAIM YOUR USERNAME NOW - BookEasy.mx 🔥
          </text>
        </g>
        
        <!-- Urgency Text -->
        <g transform="translate(${dimensions.width/2}, ${dimensions.height - 50})">
          <text x="0" y="0" text-anchor="middle" 
                font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                font-size="20" 
                font-weight="600" 
                fill="#ff6b6b">
            ⚡ Limited usernames available - Don't miss out!
          </text>
        </g>
      </svg>
    `;

    // Return clean SVG data URL (PNG conversion happens client-side)
    const finalImageUrl = svgToDataUrl(svg);

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