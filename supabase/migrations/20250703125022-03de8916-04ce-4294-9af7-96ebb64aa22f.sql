-- Add validation functions and remaining constraints

-- Add colonia constraint now that data is cleaned
ALTER TABLE public.providers
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

-- Add function to validate booking conflicts
CREATE OR REPLACE FUNCTION public.check_booking_conflicts(
  provider_id_param UUID,
  service_id_param UUID,
  booking_date_param DATE,
  booking_time_param TIME,
  duration_minutes_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  end_time TIME;
  conflict_count INTEGER;
BEGIN
  -- Calculate end time
  end_time := booking_time_param + (duration_minutes_param || ' minutes')::INTERVAL;
  
  -- Check for overlapping bookings
  SELECT COUNT(*) INTO conflict_count
  FROM public.bookings b
  JOIN public.services s ON b.service_id = s.id
  WHERE b.provider_id = provider_id_param
    AND b.booking_date = booking_date_param
    AND b.status IN ('pending', 'confirmed')
    AND (
      -- New booking starts during existing booking
      (booking_time_param >= b.booking_time AND booking_time_param < b.booking_time + (s.duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New booking ends during existing booking  
      (end_time > b.booking_time AND end_time <= b.booking_time + (s.duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New booking encompasses existing booking
      (booking_time_param <= b.booking_time AND end_time >= b.booking_time + (s.duration_minutes || ' minutes')::INTERVAL)
    );
    
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;