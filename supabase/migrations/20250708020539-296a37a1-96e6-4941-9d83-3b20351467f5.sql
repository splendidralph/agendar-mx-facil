-- Create main categories table
CREATE TABLE public.main_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  main_category_id UUID NOT NULL REFERENCES public.main_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(main_category_id, name)
);

-- Enable RLS on new tables
ALTER TABLE public.main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for main_categories (public read access)
CREATE POLICY "Anyone can view active main categories" 
ON public.main_categories 
FOR SELECT 
USING (is_active = true);

-- Create policies for subcategories (public read access)
CREATE POLICY "Anyone can view active subcategories" 
ON public.subcategories 
FOR SELECT 
USING (is_active = true);

-- Insert main categories
INSERT INTO public.main_categories (name, display_name, description, sort_order) VALUES
('belleza', 'Belleza', 'Servicios de belleza y cuidado personal', 1),
('spa', 'Spa', 'Servicios de relajación y cuidado corporal', 2),
('bienestar', 'Bienestar', 'Servicios de salud y bienestar integral', 3),
('creativo', 'Creativo', 'Servicios creativos y artísticos', 4);

-- Insert subcategories for Belleza
INSERT INTO public.subcategories (main_category_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM public.main_categories WHERE name = 'belleza'), 'barberos', 'Barberos', 'Cortes y servicios de barbería', 1),
((SELECT id FROM public.main_categories WHERE name = 'belleza'), 'estilistas', 'Estilistas', 'Peinados y estilismo capilar', 2),
((SELECT id FROM public.main_categories WHERE name = 'belleza'), 'unas', 'Uñas', 'Manicure, pedicure y nail art', 3);

-- Insert subcategories for Spa
INSERT INTO public.subcategories (main_category_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM public.main_categories WHERE name = 'spa'), 'faciales', 'Faciales', 'Tratamientos faciales y cuidado de la piel', 1),
((SELECT id FROM public.main_categories WHERE name = 'spa'), 'depilacion', 'Depilación', 'Servicios de depilación y cuidado corporal', 2),
((SELECT id FROM public.main_categories WHERE name = 'spa'), 'masajes', 'Masajes', 'Masajes terapéuticos y relajantes', 3);

-- Insert subcategories for Bienestar
INSERT INTO public.subcategories (main_category_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM public.main_categories WHERE name = 'bienestar'), 'nutriologos', 'Nutriólogos', 'Consultas nutricionales y planes alimentarios', 1),
((SELECT id FROM public.main_categories WHERE name = 'bienestar'), 'psicologos', 'Psicólogos', 'Terapia psicológica y bienestar mental', 2),
((SELECT id FROM public.main_categories WHERE name = 'bienestar'), 'entrenadores', 'Entrenadores', 'Entrenamiento personal y fitness', 3);

-- Insert subcategories for Creativo
INSERT INTO public.subcategories (main_category_id, name, display_name, description, sort_order) VALUES
((SELECT id FROM public.main_categories WHERE name = 'creativo'), 'fotografia', 'Fotografía', 'Sesiones fotográficas y servicios creativos', 1);

-- Add new columns to services table for the new category system
ALTER TABLE public.services 
ADD COLUMN main_category_id UUID REFERENCES public.main_categories(id),
ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id);

-- Add new columns to providers table for the new category system
ALTER TABLE public.providers 
ADD COLUMN main_category_id UUID REFERENCES public.main_categories(id),
ADD COLUMN subcategory_id UUID REFERENCES public.subcategories(id);

-- Create migration mapping for existing categories to new system
-- Update services table based on existing category enum values
UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'barberos')
WHERE category = 'corte_barberia';

UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'unas')
WHERE category = 'unas';

UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'estilistas')
WHERE category = 'maquillaje_cejas';

UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'spa'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'faciales')
WHERE category = 'cuidado_facial';

UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'spa'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'masajes')
WHERE category = 'masajes_relajacion';

UPDATE public.services SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'estilistas')
WHERE category = 'color_alisado';

-- Update providers table based on existing category values
UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'barberos')
WHERE category = 'corte_barberia';

UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'unas')
WHERE category = 'unas';

UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'estilistas')
WHERE category = 'maquillaje_cejas';

UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'spa'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'faciales')
WHERE category = 'cuidado_facial';

UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'spa'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'masajes')
WHERE category = 'masajes_relajacion';

UPDATE public.providers SET 
  main_category_id = (SELECT id FROM public.main_categories WHERE name = 'belleza'),
  subcategory_id = (SELECT id FROM public.subcategories WHERE name = 'estilistas')
WHERE category = 'color_alisado';

-- Add triggers for updated_at columns
CREATE TRIGGER update_main_categories_updated_at
BEFORE UPDATE ON public.main_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
BEFORE UPDATE ON public.subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();