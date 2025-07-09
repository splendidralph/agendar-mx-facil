-- Update the 4 main categories with new display names and descriptions
UPDATE public.main_categories 
SET 
  display_name = 'Cabello & Estilo',
  description = 'Barberos, Estilistas',
  updated_at = now()
WHERE name = 'belleza';

UPDATE public.main_categories 
SET 
  display_name = 'Cuidado Personal', 
  description = 'Uñas, Depilación, Faciales, Masajes',
  updated_at = now()
WHERE name = 'spa';

UPDATE public.main_categories 
SET 
  display_name = 'Salud & Coaching',
  description = 'Nutriólogas, Psicólogas, Coaches, Entrenadoras', 
  updated_at = now()
WHERE name = 'bienestar';

UPDATE public.main_categories 
SET 
  display_name = 'Servicios Creativos',
  description = 'Fotógrafos',
  updated_at = now()
WHERE name = 'creativo';

-- Update provider validation trigger to remove colonia requirement for completed profiles
CREATE OR REPLACE FUNCTION public.validate_provider_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  is_image_only_update BOOLEAN := false;
BEGIN
  -- Check if this is only a profile image update or theme color change (and possibly updated_at)
  -- by comparing OLD and NEW values for all fields except profile_image_url, theme_color and updated_at
  IF TG_OP = 'UPDATE' THEN
    is_image_only_update := (
      (OLD.business_name IS NOT DISTINCT FROM NEW.business_name) AND
      (OLD.category IS NOT DISTINCT FROM NEW.category) AND
      (OLD.bio IS NOT DISTINCT FROM NEW.bio) AND
      (OLD.address IS NOT DISTINCT FROM NEW.address) AND
      (OLD.instagram_handle IS NOT DISTINCT FROM NEW.instagram_handle) AND
      (OLD.username IS NOT DISTINCT FROM NEW.username) AND
      (OLD.whatsapp_phone IS NOT DISTINCT FROM NEW.whatsapp_phone) AND
      (OLD.colonia IS NOT DISTINCT FROM NEW.colonia) AND
      (OLD.postal_code IS NOT DISTINCT FROM NEW.postal_code) AND
      (OLD.latitude IS NOT DISTINCT FROM NEW.latitude) AND
      (OLD.longitude IS NOT DISTINCT FROM NEW.longitude) AND
      (OLD.service_radius_km IS NOT DISTINCT FROM NEW.service_radius_km) AND
      (OLD.prefers_local_clients IS NOT DISTINCT FROM NEW.prefers_local_clients) AND
      (OLD.onboarding_step IS NOT DISTINCT FROM NEW.onboarding_step) AND
      (OLD.profile_completed IS NOT DISTINCT FROM NEW.profile_completed) AND
      (OLD.phone IS NOT DISTINCT FROM NEW.phone) AND
      (OLD.main_category_id IS NOT DISTINCT FROM NEW.main_category_id) AND
      (OLD.subcategory_id IS NOT DISTINCT FROM NEW.subcategory_id) AND
      (OLD.city_id IS NOT DISTINCT FROM NEW.city_id) AND
      (OLD.zone_id IS NOT DISTINCT FROM NEW.zone_id)
    );
  END IF;

  -- Skip full validation for profile image only updates or theme color changes
  IF is_image_only_update THEN
    RETURN NEW;
  END IF;

  -- Only enforce strict validation when profile is marked as completed
  IF NEW.profile_completed = true THEN
    IF NEW.business_name IS NULL OR length(trim(NEW.business_name)) < 2 THEN
      RAISE EXCEPTION 'Business name is required for completed profiles';
    END IF;
    
    IF NEW.category IS NULL OR length(trim(NEW.category)) < 2 THEN
      RAISE EXCEPTION 'Category is required for completed profiles';
    END IF;
    
    IF NEW.username IS NULL OR length(trim(NEW.username)) < 3 THEN
      RAISE EXCEPTION 'Username is required for completed profiles';
    END IF;
    
    -- Remove colonia requirement - only require city and zone for completed profiles
    IF NEW.city_id IS NULL OR NEW.city_id = '' THEN
      RAISE EXCEPTION 'City is required for completed profiles';
    END IF;
    
    IF NEW.zone_id IS NULL OR NEW.zone_id = '' THEN
      RAISE EXCEPTION 'Zone is required for completed profiles';
    END IF;
  END IF;
  
  -- Always validate username format if provided
  IF NEW.username IS NOT NULL AND NEW.username != '' THEN
    IF NOT (NEW.username ~ '^[a-zA-Z0-9_-]{3,30}$') THEN
      RAISE EXCEPTION 'Username must be 3-30 characters, alphanumeric, hyphens and underscores only';
    END IF;
  END IF;
  
  -- Always validate phone numbers if provided - REQUIRE '+' prefix for international format
  IF NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN
    IF NOT (NEW.whatsapp_phone ~ '^\+[1-9]\d{1,14}$') THEN
      RAISE EXCEPTION 'Invalid WhatsApp phone number format - must include country code (e.g., +52, +1)';
    END IF;
  END IF;
  
  -- Always validate Instagram handle format if provided - allow empty string but validate if not empty
  IF NEW.instagram_handle IS NOT NULL AND NEW.instagram_handle != '' THEN
    IF NOT (NEW.instagram_handle ~ '^[a-zA-Z0-9._]{1,30}$') THEN
      RAISE EXCEPTION 'Invalid Instagram handle format - only letters, numbers, dots and underscores allowed';
    END IF;
  END IF;
  
  -- Always validate postal code if provided
  IF NEW.postal_code IS NOT NULL AND NEW.postal_code != '' THEN
    IF NOT (NEW.postal_code ~ '^\d{5}$') THEN
      RAISE EXCEPTION 'Postal code must be 5 digits';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;