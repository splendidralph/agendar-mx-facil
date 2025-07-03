-- Phase 1: Critical RLS Policy Fixes

-- Fix guest_bookings table policies
-- Drop overly permissive policy and add proper ones
DROP POLICY IF EXISTS "Anyone can create guest booking details" ON public.guest_bookings;

-- Add proper policies for guest_bookings
CREATE POLICY "Providers can update guest booking details" 
ON public.guest_bookings 
FOR UPDATE 
USING (booking_id IN (
  SELECT b.id FROM public.bookings b
  JOIN public.providers p ON b.provider_id = p.id
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Providers can delete guest booking details" 
ON public.guest_bookings 
FOR DELETE 
USING (booking_id IN (
  SELECT b.id FROM public.bookings b
  JOIN public.providers p ON b.provider_id = p.id
  WHERE p.user_id = auth.uid()
));

-- Add restricted policy for guest booking creation
CREATE POLICY "Can create guest booking details for valid bookings" 
ON public.guest_bookings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE id = booking_id 
    AND status = 'pending'
  )
);

-- Enhance booking creation policy
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Can create valid bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  -- Verify provider exists and is active
  EXISTS (
    SELECT 1 FROM public.providers 
    WHERE id = provider_id 
    AND is_active = true
  ) AND
  -- Verify service exists and belongs to provider
  EXISTS (
    SELECT 1 FROM public.services 
    WHERE id = service_id 
    AND provider_id = bookings.provider_id
    AND is_active = true
  ) AND
  -- Basic date validation
  booking_date >= CURRENT_DATE AND
  -- Ensure reasonable price
  total_price >= 0
);

-- Phase 2: Input Validation & Database Constraints

-- Add constraints for critical fields
ALTER TABLE public.providers 
ADD CONSTRAINT check_business_name_length CHECK (length(business_name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$'),
ADD CONSTRAINT check_instagram_handle_format CHECK (instagram_handle IS NULL OR instagram_handle ~ '^[a-zA-Z0-9_.]{1,30}$'),
ADD CONSTRAINT check_whatsapp_phone_format CHECK (whatsapp_phone IS NULL OR whatsapp_phone ~ '^\+?[1-9]\d{1,14}$');

-- Add constraints for guest booking data
ALTER TABLE public.guest_bookings
ADD CONSTRAINT check_guest_name_length CHECK (length(guest_name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_guest_phone_format CHECK (guest_phone ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT check_guest_email_format CHECK (guest_email IS NULL OR guest_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

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

-- Phase 4: Location Data Validation

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

-- Create audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events (for future admin functionality)
CREATE POLICY "Security events are restricted" 
ON public.security_events 
FOR ALL 
USING (false);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_data JSONB DEFAULT NULL,
  target_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    event_data
  ) VALUES (
    COALESCE(target_user_id, auth.uid()),
    event_type,
    event_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;