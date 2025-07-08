-- Fix existing notification preferences for providers with WhatsApp phones
UPDATE public.notification_preferences 
SET 
  whatsapp_enabled = true,
  preferred_method = 'both',
  whatsapp_phone = p.whatsapp_phone,
  updated_at = now()
FROM public.providers p
WHERE notification_preferences.provider_id = p.id
  AND p.whatsapp_phone IS NOT NULL 
  AND p.whatsapp_phone != ''
  AND notification_preferences.whatsapp_enabled = false;

-- Update the create_default_notification_preferences function to properly sync WhatsApp phone
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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