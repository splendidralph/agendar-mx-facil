-- Fix the future_booking constraint
-- Step 1: Drop the broken constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking;

-- Step 2: Update any past bookings to today's date to satisfy the new constraint
UPDATE bookings 
SET booking_date = CURRENT_DATE 
WHERE booking_date < CURRENT_DATE;

-- Step 3: Add the correct constraint
ALTER TABLE bookings 
ADD CONSTRAINT future_booking 
CHECK (booking_date >= CURRENT_DATE);