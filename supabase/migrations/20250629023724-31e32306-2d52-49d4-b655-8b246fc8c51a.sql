
-- Make client_id nullable in bookings table to support guest bookings
ALTER TABLE public.bookings ALTER COLUMN client_id DROP NOT NULL;

-- Update any existing RLS policies if needed (check current policies first)
-- Note: We'll verify if any policies need updates after this change
