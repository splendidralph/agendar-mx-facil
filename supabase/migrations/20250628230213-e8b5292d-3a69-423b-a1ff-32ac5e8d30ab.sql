
-- Add missing columns to providers table for onboarding flow
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_providers_username ON public.providers(username);

-- Add RLS policies for providers table
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own provider profile
CREATE POLICY "Users can view their own provider profile" 
  ON public.providers 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own provider profile
CREATE POLICY "Users can create their own provider profile" 
  ON public.providers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own provider profile
CREATE POLICY "Users can update their own provider profile" 
  ON public.providers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow public read access to provider profiles by username (for booking pages)
CREATE POLICY "Public can view provider profiles by username" 
  ON public.providers 
  FOR SELECT 
  USING (username IS NOT NULL AND profile_completed = TRUE);

-- Add RLS policies for services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own services
CREATE POLICY "Users can view their own services" 
  ON public.services 
  FOR SELECT 
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own services" 
  ON public.services 
  FOR INSERT 
  WITH CHECK (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own services" 
  ON public.services 
  FOR UPDATE 
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own services" 
  ON public.services 
  FOR DELETE 
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

-- Allow public read access to services for booking pages
CREATE POLICY "Public can view services for completed profiles" 
  ON public.services 
  FOR SELECT 
  USING (provider_id IN (SELECT id FROM public.providers WHERE profile_completed = TRUE));
