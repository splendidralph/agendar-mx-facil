-- Create site_banners table for admin-managed homepage banner
CREATE TABLE public.site_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_primary text NOT NULL DEFAULT '¡Ya puedes probar la beta!',
  text_secondary text DEFAULT '¡Estamos en beta!',
  is_active boolean NOT NULL DEFAULT true,
  animation_type text NOT NULL DEFAULT 'marquee',
  background_color text DEFAULT 'hsl(var(--primary))',
  text_color text DEFAULT 'hsl(var(--primary-foreground))',
  link_url text,
  is_dismissible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON public.site_banners
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage banners
CREATE POLICY "Admins can manage banners"
  ON public.site_banners
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_banners_updated_at
  BEFORE UPDATE ON public.site_banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default banner
INSERT INTO public.site_banners (
  text_primary,
  text_secondary,
  animation_type,
  is_active,
  is_dismissible
) VALUES (
  '¡Ya puedes probar la beta!',
  '¡Estamos en beta!',
  'marquee',
  true,
  true
);