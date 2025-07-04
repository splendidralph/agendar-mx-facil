-- Fix security definer view linter error by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.providers_with_location;

-- Recreate the view with explicit SECURITY INVOKER
CREATE VIEW public.providers_with_location
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.user_id,
  p.business_name,
  p.bio,
  p.instagram_handle,
  p.profile_image_url,
  p.location_id,
  p.address,
  p.phone,
  p.is_active,
  p.rating,
  p.total_reviews,
  p.created_at,
  p.updated_at,
  p.username,
  p.profile_completed,
  p.category,
  p.onboarding_step,
  p.whatsapp_phone,
  p.colonia,
  p.postal_code,
  p.latitude,
  p.longitude,
  p.service_radius_km,
  p.prefers_local_clients,
  l.name AS location_name,
  l.city,
  l.state,
  l.colonia AS location_colonia,
  l.postal_code AS location_postal_code
FROM providers p
LEFT JOIN locations l ON p.location_id = l.id;