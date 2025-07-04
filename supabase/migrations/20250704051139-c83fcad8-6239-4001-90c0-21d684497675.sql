-- Fix RLS policy for bookings to handle guest bookings properly
-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Can create valid bookings" ON public.bookings;

-- Create a more permissive INSERT policy that properly handles guest bookings
CREATE POLICY "Allow valid booking creation" ON public.bookings
  FOR INSERT 
  WITH CHECK (
    -- Ensure provider exists and is active
    EXISTS (
      SELECT 1 FROM public.providers 
      WHERE id = provider_id AND is_active = true
    )
    AND
    -- Ensure service exists, is active, and belongs to the provider
    EXISTS (
      SELECT 1 FROM public.services 
      WHERE id = service_id 
        AND provider_id = bookings.provider_id 
        AND is_active = true
    )
    AND
    -- Ensure booking date is not in the past
    booking_date >= CURRENT_DATE
    AND
    -- Ensure price is non-negative
    total_price >= 0
  );