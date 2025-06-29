
-- Add WhatsApp phone field to providers table
ALTER TABLE public.providers 
ADD COLUMN whatsapp_phone text;

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  preferred_method text NOT NULL DEFAULT 'both' CHECK (preferred_method IN ('email_only', 'whatsapp_only', 'both')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create unique constraint to ensure one preference record per provider
CREATE UNIQUE INDEX notification_preferences_provider_id_idx ON public.notification_preferences(provider_id);

-- Add RLS policies for notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own notification preferences" 
  ON public.notification_preferences 
  FOR SELECT 
  USING (provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  ));

CREATE POLICY "Providers can update their own notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (provider_id IN (
    SELECT id FROM public.providers WHERE user_id = auth.uid()
  ));

-- Add trigger to automatically create default notification preferences when a provider is created
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (provider_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_provider_created_notification_preferences
  AFTER INSERT ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();
