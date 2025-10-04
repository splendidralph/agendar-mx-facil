-- First, temporarily disable the future_booking constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking;

-- Change default status for new bookings to 'confirmed'
ALTER TABLE bookings 
ALTER COLUMN status SET DEFAULT 'confirmed'::booking_status;

-- Update all existing 'pending' bookings to 'confirmed'
UPDATE bookings 
SET status = 'confirmed' 
WHERE status = 'pending';

-- Re-add the future booking constraint (only for new inserts)
ALTER TABLE bookings 
ADD CONSTRAINT future_booking 
CHECK (
  -- Allow updates to existing bookings
  (created_at IS NOT NULL AND created_at < now()) 
  OR 
  -- For new bookings, enforce future date
  (created_at IS NULL AND booking_date >= CURRENT_DATE)
);