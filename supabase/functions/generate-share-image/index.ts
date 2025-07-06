import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create SVG content for the shareable image
    const svg = `
      <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)"/>
        
        <!-- Main content container -->
        <g transform="translate(${dimensions.width/2}, ${format === 'story' ? 400 : 200})">
          <!-- Profile image placeholder circle -->
          <circle cx="0" cy="0" r="120" fill="white" filter="url(#shadow)"/>
          <circle cx="0" cy="0" r="110" fill="#f0f0f0"/>
          
          <!-- Business name -->
          <text x="0" y="200" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="48" 
                font-weight="bold" 
                fill="white">
            ${provider.business_name || 'Mi Negocio'}
          </text>
          
          <!-- Username -->
          <text x="0" y="260" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="36" 
                fill="white" 
                opacity="0.9">
            @${provider.username}
          </text>
          
          <!-- Category -->
          <text x="0" y="320" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="28" 
                fill="white" 
                opacity="0.8">
            ${provider.category || 'Servicios Profesionales'}
          </text>
          
          <!-- Call to action -->
          <rect x="-200" y="380" width="400" height="80" 
                rx="40" fill="white" filter="url(#shadow)"/>
          <text x="0" y="430" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="32" 
                font-weight="bold" 
                fill="#667eea">
            ¡Reserva tu cita!
          </text>
          
          <!-- Booking URL -->
          <text x="0" y="520" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                fill="white" 
                opacity="0.9">
            bookeasy.mx/${provider.username}
          </text>
        </g>
        
        <!-- BookEasy branding at bottom -->
        <g transform="translate(${dimensions.width/2}, ${dimensions.height - 100})">
          <rect x="-150" y="-30" width="300" height="60" 
                rx="30" fill="rgba(255,255,255,0.2)"/>
          <text x="0" y="5" text-anchor="middle" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                font-weight="bold" 
                fill="white">
            BookEasy.mx
          </text>
        </g>
        
        <!-- QR Code placeholder -->
        <g transform="translate(${dimensions.width - 150}, ${dimensions.height - 150})">
          <rect x="-50" y="-50" width="100" height="100" 
                fill="white" rx="10" filter="url(#shadow)"/>
          <rect x="-40" y="-40" width="80" height="80" 
                fill="#333" rx="5"/>
          <!-- QR pattern simulation -->
          <rect x="-35" y="-35" width="10" height="10" fill="white"/>
          <rect x="-20" y="-35" width="10" height="10" fill="white"/>
          <rect x="-35" y="-20" width="10" height="10" fill="white"/>
          <rect x="25" y="-35" width="10" height="10" fill="white"/>
          <rect x="25" y="-20" width="10" height="10" fill="white"/>
          <rect x="-35" y="25" width="10" height="10" fill="white"/>
          <rect x="-20" y="25" width="10" height="10" fill="white"/>
        </g>
      </svg>
    `

    // Convert SVG to base64
    const svgBase64 = btoa(svg)
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`

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