-- Add whatsapp_phone column to notification_preferences table
ALTER TABLE public.notification_preferences 
ADD COLUMN whatsapp_phone TEXT;