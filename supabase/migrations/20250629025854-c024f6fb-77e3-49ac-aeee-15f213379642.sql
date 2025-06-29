
-- Create default notification preferences for existing providers who don't have them
INSERT INTO public.notification_preferences (provider_id, email_enabled, whatsapp_enabled, preferred_method)
SELECT 
  p.id as provider_id,
  true as email_enabled,
  CASE 
    WHEN p.whatsapp_phone IS NOT NULL AND p.whatsapp_phone != '' THEN true 
    ELSE false 
  END as whatsapp_enabled,
  CASE 
    WHEN p.whatsapp_phone IS NOT NULL AND p.whatsapp_phone != '' THEN 'both'::text
    ELSE 'email_only'::text
  END as preferred_method
FROM public.providers p
LEFT JOIN public.notification_preferences np ON p.id = np.provider_id
WHERE np.provider_id IS NULL;

-- Update the trigger function to handle edge cases where it might not have fired
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
