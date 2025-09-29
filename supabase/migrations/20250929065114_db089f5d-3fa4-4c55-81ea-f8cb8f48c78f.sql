-- Fix the security definer view issue with correct column names

-- Drop and recreate the public_provider_profiles view without security barrier
DROP VIEW IF EXISTS public.public_provider_profiles CASCADE;

-- Create a simple view without any security definer properties
CREATE VIEW public.public_provider_profiles AS
SELECT 
  p.id,
  p.business_name,
  p.bio,
  p.category,
  p.username,
  p.profile_image_url,
  p.avg_rating,
  p.review_count,
  p.city_id,
  p.zone_id,
  p.main_category_id,
  p.subcategory_id,
  p.theme_color,
  p.service_radius_km,
  p.prefers_local_clients,
  p.instagram_handle,
  p.colonia,
  p.created_at,
  p.updated_at
FROM public.providers p
WHERE p.profile_completed = true 
  AND p.is_active = true;

-- Grant appropriate permissions for the view
GRANT SELECT ON public.public_provider_profiles TO anon, authenticated;

-- Check if providers_with_location has security definer - if so, we need to drop it too
-- This view seems to expose sensitive data and should be restricted
DROP VIEW IF EXISTS public.providers_with_location CASCADE;

-- Create a secure replacement that doesn't expose sensitive data
CREATE VIEW public.providers_with_location AS
SELECT 
  p.id,
  p.business_name,
  p.bio,
  p.category,
  p.username,
  p.profile_image_url,
  p.avg_rating,
  p.review_count,
  p.city_id,
  p.zone_id,
  p.main_category_id,
  p.subcategory_id,
  p.theme_color,
  p.service_radius_km,
  p.prefers_local_clients,
  p.instagram_handle,
  p.colonia,
  p.created_at,
  p.updated_at,
  p.profile_completed,
  p.is_active,
  l.name AS location_name,
  l.city,
  l.state,
  l.colonia AS location_colonia
  -- Excluded sensitive fields: user_id, whatsapp_phone, phone, address, postal_code, latitude, longitude
FROM public.providers p
LEFT JOIN public.locations l ON p.location_id = l.id
WHERE p.profile_completed = true 
  AND p.is_active = true;

-- Grant appropriate permissions
GRANT SELECT ON public.providers_with_location TO anon, authenticated;

-- Log the security view fixes
SELECT public.log_security_event(
  'security_definer_views_fixed',
  jsonb_build_object(
    'views_recreated', ARRAY['public_provider_profiles', 'providers_with_location'],
    'security_barrier_removed', true,
    'sensitive_data_excluded', true,
    'timestamp', now()
  )
);