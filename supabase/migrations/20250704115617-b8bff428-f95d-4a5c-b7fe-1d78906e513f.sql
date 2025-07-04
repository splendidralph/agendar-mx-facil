-- Fix function search_path security warnings by adding explicit search_path
-- Update all 10 functions to include SET search_path = ''

-- 1. Update calculate_distance_km function
CREATE OR REPLACE FUNCTION public.calculate_distance_km(lat1 numeric, lng1 numeric, lat2 numeric, lng2 numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$;

-- 2. Update create_default_notification_preferences function
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if preferences already exist to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE provider_id = NEW.id) THEN
    INSERT INTO public.notification_preferences (
      provider_id,
      email_enabled,
      whatsapp_enabled,
      preferred_method
    ) VALUES (
      NEW.id,
      true,
      CASE 
        WHEN NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN true 
        ELSE false 
      END,
      CASE 
        WHEN NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN 'both'
        ELSE 'email_only'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_data jsonb DEFAULT NULL::jsonb, target_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 4. Update check_booking_conflicts function
CREATE OR REPLACE FUNCTION public.check_booking_conflicts(provider_id_param uuid, service_id_param uuid, booking_date_param date, booking_time_param time without time zone, duration_minutes_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 5. Update validate_provider_profile function
CREATE OR REPLACE FUNCTION public.validate_provider_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only enforce strict validation when profile is marked as completed
  IF NEW.profile_completed = true THEN
    IF NEW.business_name IS NULL OR length(trim(NEW.business_name)) < 2 THEN
      RAISE EXCEPTION 'Business name is required for completed profiles';
    END IF;
    
    IF NEW.category IS NULL OR length(trim(NEW.category)) < 2 THEN
      RAISE EXCEPTION 'Category is required for completed profiles';
    END IF;
    
    IF NEW.username IS NULL OR length(trim(NEW.username)) < 3 THEN
      RAISE EXCEPTION 'Username is required for completed profiles';
    END IF;
    
    -- Only require colonia for completed profiles, not during onboarding
    IF NEW.colonia IS NULL OR length(trim(NEW.colonia)) < 2 THEN
      RAISE EXCEPTION 'Colonia is required for completed profiles';
    END IF;
  END IF;
  
  -- Always validate username format if provided
  IF NEW.username IS NOT NULL AND NEW.username != '' THEN
    IF NOT (NEW.username ~ '^[a-zA-Z0-9_-]{3,30}$') THEN
      RAISE EXCEPTION 'Username must be 3-30 characters, alphanumeric, hyphens and underscores only';
    END IF;
  END IF;
  
  -- Always validate phone numbers if provided
  IF NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN
    IF NOT (NEW.whatsapp_phone ~ '^\+?[1-9]\d{1,14}$') THEN
      RAISE EXCEPTION 'Invalid WhatsApp phone number format';
    END IF;
  END IF;
  
  -- Always validate postal code if provided
  IF NEW.postal_code IS NOT NULL AND NEW.postal_code != '' THEN
    IF NOT (NEW.postal_code ~ '^\d{5}$') THEN
      RAISE EXCEPTION 'Postal code must be 5 digits';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Update refresh_analytics_views function
CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.provider_analytics;
  REFRESH MATERIALIZED VIEW public.colonia_analytics;
END;
$$;

-- 7. Update calculate_dashboard_metrics function
CREATE OR REPLACE FUNCTION public.calculate_dashboard_metrics(date_range text DEFAULT '30d'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
  interval_clause INTERVAL;
BEGIN
  -- Parse date range
  CASE date_range
    WHEN '7d' THEN interval_clause := INTERVAL '7 days';
    WHEN '30d' THEN interval_clause := INTERVAL '30 days';
    WHEN '90d' THEN interval_clause := INTERVAL '90 days';
    ELSE interval_clause := INTERVAL '30 days';
  END CASE;

  SELECT jsonb_build_object(
    'total_providers', (SELECT COUNT(*) FROM public.providers WHERE profile_completed = true),
    'active_providers', (SELECT COUNT(*) FROM public.provider_analytics WHERE status = 'active'),
    'total_bookings', (SELECT COUNT(*) FROM public.bookings WHERE booking_date >= CURRENT_DATE - interval_clause),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE booking_date >= CURRENT_DATE - interval_clause AND status IN ('confirmed', 'completed')),
    'activated_colonias', (SELECT COUNT(*) FROM public.colonia_analytics WHERE activation_status = 'activated'),
    'avg_bookings_per_provider', (SELECT ROUND(AVG(total_bookings), 2) FROM public.provider_analytics WHERE status = 'active'),
    'calculated_at', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- 8. Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_id_param
  );
$$;

-- 9. Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 10. Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  incoming_role TEXT;
  full_name TEXT;
  safe_role public.user_role;
BEGIN
  IF NEW.raw_user_meta_data IS NULL THEN
    incoming_role := NULL;
    full_name := NULL;
  ELSE
    incoming_role := NEW.raw_user_meta_data ->> 'role';
    full_name := NEW.raw_user_meta_data ->> 'full_name';
  END IF;

  IF incoming_role IS NULL OR incoming_role = '' THEN
    safe_role := 'client';
  ELSE
    BEGIN
      safe_role := incoming_role::public.user_role;
    EXCEPTION WHEN OTHERS THEN
      safe_role := 'client';
    END;
  END IF;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(full_name, NEW.email), safe_role);

  RETURN NEW;
END;
$$;

-- Fix materialized views security warnings by enabling RLS and restricting access
-- Enable RLS on materialized views
ALTER MATERIALIZED VIEW public.provider_analytics ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW public.colonia_analytics ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies for materialized views
CREATE POLICY "Only admins can access provider analytics" 
ON public.provider_analytics 
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can access colonia analytics" 
ON public.colonia_analytics 
FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));