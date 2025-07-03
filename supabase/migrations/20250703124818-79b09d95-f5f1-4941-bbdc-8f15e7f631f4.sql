-- First, let's check and fix existing data before adding constraints

-- Phase 1: Critical RLS Policy Fixes (without data constraints first)

-- Fix guest_bookings table policies
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

-- Clean up existing data before adding constraints
-- Remove invalid WhatsApp phone numbers
UPDATE public.providers 
SET whatsapp_phone = NULL 
WHERE whatsapp_phone IS NOT NULL 
AND whatsapp_phone !~ '^\+?[1-9]\d{1,14}$';

-- Clean up invalid usernames
UPDATE public.providers 
SET username = NULL 
WHERE username IS NOT NULL 
AND username !~ '^[a-zA-Z0-9_-]{3,30}$';

-- Clean up invalid Instagram handles
UPDATE public.providers 
SET instagram_handle = NULL 
WHERE instagram_handle IS NOT NULL 
AND instagram_handle !~ '^[a-zA-Z0-9_.]{1,30}$';

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