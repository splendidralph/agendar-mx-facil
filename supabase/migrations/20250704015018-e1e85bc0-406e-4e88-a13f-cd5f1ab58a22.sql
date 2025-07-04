-- Phase 2: Fix Data Validation Issues - Make constraints more permissive for onboarding

-- Allow business_name to be nullable during onboarding (will be required when profile_completed = true)
ALTER TABLE public.providers ALTER COLUMN business_name DROP NOT NULL;

-- Update the validation trigger to be more flexible during onboarding
DROP TRIGGER IF EXISTS validate_provider_profile_trigger ON public.providers;
DROP FUNCTION IF EXISTS public.validate_provider_profile();

CREATE OR REPLACE FUNCTION public.validate_provider_profile()
RETURNS TRIGGER AS $$
BEGIN
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
    
    -- Only require colonia for completed profiles, not during onboarding
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
  
  -- Always validate phone numbers if provided
  IF NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN
    IF NOT (NEW.whatsapp_phone ~ '^\+?[1-9]\d{1,14}$') THEN
      RAISE EXCEPTION 'Invalid WhatsApp phone number format';
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
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER validate_provider_profile_trigger
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_provider_profile();

-- Remove the strict colonia constraint that was blocking onboarding
ALTER TABLE public.providers DROP CONSTRAINT IF EXISTS check_colonia_length;

-- Add a more flexible colonia constraint that allows null/empty during onboarding
ALTER TABLE public.providers 
ADD CONSTRAINT check_colonia_length_flexible 
CHECK (colonia IS NULL OR colonia = '' OR length(colonia) BETWEEN 2 AND 100);