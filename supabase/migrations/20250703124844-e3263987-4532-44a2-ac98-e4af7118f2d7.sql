-- Phase 2: Add Input Validation & Database Constraints (after data cleanup)

-- Add constraints for critical fields  
ALTER TABLE public.providers 
ADD CONSTRAINT check_business_name_length CHECK (length(business_name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]{3,30}$'),
ADD CONSTRAINT check_instagram_handle_format CHECK (instagram_handle IS NULL OR instagram_handle ~ '^[a-zA-Z0-9_.]{1,30}$'),
ADD CONSTRAINT check_whatsapp_phone_format CHECK (whatsapp_phone IS NULL OR whatsapp_phone ~ '^\+?[1-9]\d{1,14}$');

-- Add constraints for services
ALTER TABLE public.services
ADD CONSTRAINT check_service_name_length CHECK (length(name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_service_price_positive CHECK (price > 0),
ADD CONSTRAINT check_service_duration_reasonable CHECK (duration_minutes BETWEEN 15 AND 480);

-- Add constraints for bookings
ALTER TABLE public.bookings
ADD CONSTRAINT check_booking_price_positive CHECK (total_price >= 0),
ADD CONSTRAINT check_booking_date_future CHECK (booking_date >= CURRENT_DATE),
ADD CONSTRAINT check_booking_time_valid CHECK (booking_time BETWEEN '06:00:00' AND '23:59:59');

-- Add constraints for location data
ALTER TABLE public.providers
ADD CONSTRAINT check_postal_code_format CHECK (postal_code IS NULL OR postal_code ~ '^\d{5}$'),
ADD CONSTRAINT check_colonia_length CHECK (colonia IS NULL OR length(colonia) BETWEEN 2 AND 100);

-- Add validation function for provider profile completeness
CREATE OR REPLACE FUNCTION public.validate_provider_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required fields are present when profile is marked as completed
  IF NEW.profile_completed = true THEN
    IF NEW.business_name IS NULL OR length(trim(NEW.business_name)) < 2 THEN
      RAISE EXCEPTION 'Business name is required for completed profiles';
    END IF;
    
    IF NEW.category IS NULL OR length(trim(NEW.category)) < 2 THEN
      RAISE EXCEPTION 'Category is required for completed profiles';
    END IF;
    
    IF NEW.colonia IS NULL OR length(trim(NEW.colonia)) < 2 THEN
      RAISE EXCEPTION 'Colonia is required for completed profiles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for provider profile validation
CREATE TRIGGER validate_provider_profile_trigger
  BEFORE INSERT OR UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_provider_profile();