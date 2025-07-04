-- Create admin analytics infrastructure
-- 1. Admin analytics tables for caching computed metrics
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  date_range TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '1 hour'
);

-- 2. Event tracking for funnel analytics
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  provider_id UUID REFERENCES providers(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Admin users table with role management
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Materialized view for provider analytics
CREATE MATERIALIZED VIEW public.provider_analytics AS
SELECT 
  p.id,
  p.business_name,
  p.category,
  p.colonia,
  p.created_at as onboarded_at,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.booking_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as bookings_last_7_days,
  COUNT(CASE WHEN b.booking_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as bookings_last_30_days,
  COALESCE(SUM(b.total_price), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN b.booking_date >= CURRENT_DATE - INTERVAL '30 days' THEN b.total_price END), 0) as revenue_last_30_days,
  COUNT(DISTINCT b.client_id) as unique_clients,
  CASE WHEN COUNT(b.id) > 0 THEN 'active' ELSE 'inactive' END as status
FROM providers p
LEFT JOIN bookings b ON p.id = b.provider_id AND b.status IN ('confirmed', 'completed')
WHERE p.profile_completed = true
GROUP BY p.id, p.business_name, p.category, p.colonia, p.created_at;

-- 5. Materialized view for colonia analytics
CREATE MATERIALIZED VIEW public.colonia_analytics AS
SELECT 
  COALESCE(p.colonia, 'Unknown') as colonia,
  COUNT(DISTINCT p.id) as provider_count,
  COUNT(DISTINCT CASE WHEN pa.status = 'active' THEN p.id END) as active_providers,
  COUNT(b.id) as total_bookings,
  COUNT(CASE WHEN b.booking_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as bookings_last_30_days,
  COALESCE(SUM(b.total_price), 0) as total_revenue,
  CASE WHEN COUNT(DISTINCT p.id) >= 5 AND COUNT(b.id) >= 10 THEN 'activated' ELSE 'developing' END as activation_status
FROM providers p
LEFT JOIN bookings b ON p.id = b.provider_id AND b.status IN ('confirmed', 'completed')
LEFT JOIN provider_analytics pa ON p.id = pa.id
WHERE p.profile_completed = true
GROUP BY p.colonia;

-- 6. Enable RLS on analytics tables
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for admin access
CREATE POLICY "Only admins can access analytics cache" 
ON public.analytics_cache 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'analyst')
  )
);

CREATE POLICY "Only admins can access analytics events" 
ON public.analytics_events 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.role IN ('admin', 'analyst')
  )
);

CREATE POLICY "Admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users au 
    WHERE au.user_id = auth.uid() 
    AND au.role = 'admin'
  )
);

-- 8. Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW provider_analytics;
  REFRESH MATERIALIZED VIEW colonia_analytics;
END;
$$;

-- 9. Function to calculate key metrics
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(date_range TEXT DEFAULT '30d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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
    'total_providers', (SELECT COUNT(*) FROM providers WHERE profile_completed = true),
    'active_providers', (SELECT COUNT(*) FROM provider_analytics WHERE status = 'active'),
    'total_bookings', (SELECT COUNT(*) FROM bookings WHERE booking_date >= CURRENT_DATE - interval_clause),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE booking_date >= CURRENT_DATE - interval_clause AND status IN ('confirmed', 'completed')),
    'activated_colonias', (SELECT COUNT(*) FROM colonia_analytics WHERE activation_status = 'activated'),
    'avg_bookings_per_provider', (SELECT ROUND(AVG(total_bookings), 2) FROM provider_analytics WHERE status = 'active'),
    'calculated_at', now()
  ) INTO result;

  RETURN result;
END;
$$;

-- 10. Create indexes for performance
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_provider_id ON analytics_events(provider_id);
CREATE INDEX idx_analytics_cache_metric_name ON analytics_cache(metric_name);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache(expires_at);

-- 11. Create trigger for updated_at on admin_users
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();