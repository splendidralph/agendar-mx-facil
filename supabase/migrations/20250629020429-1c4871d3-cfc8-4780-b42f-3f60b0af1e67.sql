
-- Enable RLS for bookings table if not already enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can update their own bookings" ON public.bookings;

-- Allow users to view bookings where they are either the client or the provider
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (
    client_id = auth.uid() OR 
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

-- Allow anyone to create bookings (for guest bookings)
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Allow providers to update their bookings
CREATE POLICY "Providers can update their bookings" ON public.bookings
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

-- Allow clients to update their own bookings
CREATE POLICY "Clients can update their own bookings" ON public.bookings
  FOR UPDATE USING (client_id = auth.uid());

-- Create a table for guest booking details since guest users don't have accounts
CREATE TABLE IF NOT EXISTS public.guest_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for guest_bookings
ALTER TABLE public.guest_bookings ENABLE ROW LEVEL SECURITY;

-- Allow providers to view guest booking details for their bookings
CREATE POLICY "Providers can view guest booking details" ON public.guest_bookings
  FOR SELECT USING (
    booking_id IN (
      SELECT b.id FROM public.bookings b
      JOIN public.providers p ON b.provider_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Allow anyone to insert guest booking details (for new bookings)
CREATE POLICY "Anyone can create guest booking details" ON public.guest_bookings
  FOR INSERT WITH CHECK (true);
