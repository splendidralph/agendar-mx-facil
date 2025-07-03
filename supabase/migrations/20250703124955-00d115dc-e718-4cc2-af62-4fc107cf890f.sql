-- Clean up existing colonia data and add constraints step by step

-- Fix existing colonia data
UPDATE public.providers 
SET colonia = NULL 
WHERE colonia IS NOT NULL 
AND (length(colonia) < 2 OR length(colonia) > 100);

-- Add constraints one by one to identify issues

-- Add constraints for critical fields (skip colonia for now)
ALTER TABLE public.providers 
ADD CONSTRAINT check_business_name_length CHECK (length(business_name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_-]{3,30}$'),
ADD CONSTRAINT check_instagram_handle_format CHECK (instagram_handle IS NULL OR instagram_handle ~ '^[a-zA-Z0-9_.]{1,30}$'),
ADD CONSTRAINT check_whatsapp_phone_format CHECK (whatsapp_phone IS NULL OR whatsapp_phone ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT check_postal_code_format CHECK (postal_code IS NULL OR postal_code ~ '^\d{5}$');

-- Add constraints for services
ALTER TABLE public.services
ADD CONSTRAINT check_service_name_length CHECK (length(name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_service_price_positive CHECK (price > 0),
ADD CONSTRAINT check_service_duration_reasonable CHECK (duration_minutes BETWEEN 15 AND 480);

-- Add constraints for bookings
ALTER TABLE public.bookings
ADD CONSTRAINT check_booking_price_positive CHECK (total_price >= 0),
ADD CONSTRAINT check_booking_time_valid CHECK (booking_time BETWEEN '06:00:00' AND '23:59:59');

-- Add constraints for guest booking data
ALTER TABLE public.guest_bookings
ADD CONSTRAINT check_guest_name_length CHECK (length(guest_name) BETWEEN 2 AND 100),
ADD CONSTRAINT check_guest_phone_format CHECK (guest_phone ~ '^\+?[1-9]\d{1,14}$'),
ADD CONSTRAINT check_guest_email_format CHECK (guest_email IS NULL OR guest_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');