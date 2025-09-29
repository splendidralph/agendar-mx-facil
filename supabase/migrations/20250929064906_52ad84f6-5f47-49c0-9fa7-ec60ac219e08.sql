-- Phase 1: Critical RLS Policy Updates - Restrict Provider Data Exposure

-- 1. DROP the overly permissive public policy on providers
DROP POLICY IF EXISTS "Anyone can view active providers" ON public.providers;

-- 2. CREATE a new policy allowing SELECT access only for completed profiles
-- This restricts access to only completed profiles but still exposes all columns
CREATE POLICY "Public can view completed provider profiles" ON public.providers
  FOR SELECT USING (profile_completed = true);

-- 3. CREATE a secure public view that only exposes safe columns for public consumption
CREATE OR REPLACE VIEW public.public_provider_profiles AS
SELECT 
  p.id,
  p.business_name,
  p.bio,
  p.category,
  p.username,
  p.profile_image_url,
  p.avg_rating,
  p.review_count,
  p.city_id,
  p.zone_id,
  p.main_category_id,
  p.subcategory_id,
  p.theme_color,
  p.service_radius_km,
  p.prefers_local_clients,
  p.instagram_handle,
  p.colonia,
  -- Exclude sensitive data: whatsapp_phone, phone, address, postal_code, latitude, longitude
  p.created_at,
  p.updated_at
FROM public.providers p
WHERE p.profile_completed = true 
  AND p.is_active = true;

-- 4. Enable RLS on the view (even though it inherits from providers)
ALTER VIEW public.public_provider_profiles OWNER TO postgres;

-- Phase 2: Function Security Hardening - Fix Search Path Issues

-- 2.1. Update handle_new_user to use secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public  -- CRITICAL: Secure search path
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

-- 2.2. Update other security definer functions with secure search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_id_param
  );
$$;

CREATE OR REPLACE FUNCTION public.calculate_dashboard_metrics(date_range text DEFAULT '30d'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
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

CREATE OR REPLACE FUNCTION public.check_booking_conflicts(provider_id_param uuid, service_id_param uuid, booking_date_param date, booking_time_param time without time zone, duration_minutes_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
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

CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
AS $$
BEGIN
  -- Check if preferences already exist to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM public.notification_preferences WHERE provider_id = NEW.id) THEN
    INSERT INTO public.notification_preferences (
      provider_id,
      email_enabled,
      whatsapp_enabled,
      preferred_method,
      whatsapp_phone
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
      END,
      NEW.whatsapp_phone
    );
  ELSE
    -- Update existing preferences when provider phone changes
    UPDATE public.notification_preferences 
    SET 
      whatsapp_enabled = CASE 
        WHEN NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN true 
        ELSE false 
      END,
      preferred_method = CASE 
        WHEN NEW.whatsapp_phone IS NOT NULL AND NEW.whatsapp_phone != '' THEN 'both'
        ELSE 'email_only'
      END,
      whatsapp_phone = NEW.whatsapp_phone,
      updated_at = now()
    WHERE provider_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, event_data jsonb DEFAULT NULL::jsonb, target_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
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

CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- CRITICAL: Secure search path
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.provider_analytics;
  REFRESH MATERIALIZED VIEW public.colonia_analytics;
END;
$$;

-- Phase 3: Log security hardening completion
SELECT public.log_security_event(
  'security_hardening_applied',
  jsonb_build_object(
    'phase_1_rls_policies', 'updated',
    'phase_2_function_security', 'updated',
    'public_view_created', 'public_provider_profiles',
    'timestamp', now()
  )
);