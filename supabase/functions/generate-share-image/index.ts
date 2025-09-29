import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

import { corsHeaders, IMAGE_DIMENSIONS } from './constants.ts';
import { generateQRCodeBase64 } from './qr-generator.ts';
import { svgToDataUrl, fetchProfileImageBase64 } from './utils.ts';
import { generateSVGTemplate } from './svg-template.ts';
import type { GenerateImageRequest, GenerateImageResponse } from './types.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { providerId, format = 'story' }: GenerateImageRequest = await req.json()

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
    const dimensions = IMAGE_DIMENSIONS[format];

    // Fetch profile image if available
    const profileImageBase64 = await fetchProfileImageBase64(provider.profile_image_url);

    // Generate QR code as base64 PNG
    const bookingUrl = `https://bookeasy.mx/${provider.username}`;
    const qrCodeBase64 = await generateQRCodeBase64(bookingUrl, 300); // Bigger QR code

    // Generate SVG template
    const svg = generateSVGTemplate(provider, dimensions, format, profileImageBase64, qrCodeBase64);

    // Return clean SVG data URL (PNG conversion happens client-side)
    const finalImageUrl = svgToDataUrl(svg);

    console.log('Generated image for provider:', provider.username);
    console.log('SVG size:', svg.length, 'characters');

    const response: GenerateImageResponse = {
      image: finalImageUrl,
      format,
      provider: {
        business_name: provider.business_name,
        username: provider.username
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating share image:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})