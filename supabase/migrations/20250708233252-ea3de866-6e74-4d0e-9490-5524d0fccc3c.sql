-- Update database validation trigger to require '+' prefix for phone numbers
CREATE OR REPLACE FUNCTION public.validate_provider_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  is_image_only_update BOOLEAN := false;
BEGIN
  -- Check if this is only a profile image update (and possibly updated_at)
  -- by comparing OLD and NEW values for all fields except profile_image_url and updated_at
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
      (OLD.phone IS NOT DISTINCT FROM NEW.phone)
    );
  END IF;

  -- Skip full validation for profile image only updates
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
    
    -- Only require colonia for completed profiles, not during onboarding or image updates
    IF NEW.colonia IS NULL OR length(trim(NEW.colonia)) < 2 THEN
      RAISE EXCEPTION 'Colonia is required for completed profiles';
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
  
  -- Always validate postal code if provided
  IF NEW.postal_code IS NOT NULL AND NEW.postal_code != '' THEN
    IF NOT (NEW.postal_code ~ '^\d{5}$') THEN
      RAISE EXCEPTION 'Postal code must be 5 digits';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update any existing phone numbers that don't have the '+' prefix (but only valid ones)
UPDATE public.providers 
SET whatsapp_phone = '+52' || whatsapp_phone 
WHERE whatsapp_phone IS NOT NULL 
  AND whatsapp_phone != '' 
  AND whatsapp_phone !~ '^\+' 
  AND whatsapp_phone ~ '^[0-9]{10,}$';

-- Update notification preferences to match provider phone numbers
UPDATE public.notification_preferences 
SET whatsapp_phone = p.whatsapp_phone,
    whatsapp_enabled = CASE 
      WHEN p.whatsapp_phone IS NOT NULL AND p.whatsapp_phone != '' THEN true 
      ELSE false 
    END,
    preferred_method = CASE 
      WHEN p.whatsapp_phone IS NOT NULL AND p.whatsapp_phone != '' THEN 'both'
      ELSE 'email_only'
    END
FROM public.providers p 
WHERE notification_preferences.provider_id = p.id;