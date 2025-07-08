-- Create cities table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  state TEXT DEFAULT 'Baja California',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create zones table
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(city_id, name)
);

-- Add new columns to locations table
ALTER TABLE public.locations 
ADD COLUMN city_id UUID REFERENCES public.cities(id),
ADD COLUMN zone_id UUID REFERENCES public.zones(id);

-- Add new columns to providers table for direct city/zone reference
ALTER TABLE public.providers 
ADD COLUMN city_id UUID REFERENCES public.cities(id),
ADD COLUMN zone_id UUID REFERENCES public.zones(id);

-- Enable RLS on new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cities
CREATE POLICY "Anyone can view active cities" 
ON public.cities 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for zones
CREATE POLICY "Anyone can view active zones" 
ON public.zones 
FOR SELECT 
USING (is_active = true);

-- Insert cities data
INSERT INTO public.cities (name, sort_order) VALUES
('Tijuana', 1),
('Rosarito', 2),
('Tecate', 3);

-- Get city IDs for zones insertion
DO $$
DECLARE
  tijuana_id UUID;
  rosarito_id UUID;
  tecate_id UUID;
BEGIN
  SELECT id INTO tijuana_id FROM public.cities WHERE name = 'Tijuana';
  SELECT id INTO rosarito_id FROM public.cities WHERE name = 'Rosarito';
  SELECT id INTO tecate_id FROM public.cities WHERE name = 'Tecate';

  -- Insert Tijuana zones
  INSERT INTO public.zones (city_id, name, display_name, sort_order) VALUES
  (tijuana_id, 'centro_zona_centro', 'Centro / Zona Centro', 1),
  (tijuana_id, 'zona_rio_alrededores', 'Zona Río y Alrededores', 2),
  (tijuana_id, 'playas_costa_oeste', 'Playas / Costa Oeste', 3),
  (tijuana_id, 'otay_mesa_sureste', 'Otay Mesa y Sureste', 4),
  (tijuana_id, 'cinco_diez_este_central', '5 y 10 / Este Central', 5),
  (tijuana_id, 'villa_fontana_areas_cercanas', 'Villa Fontana y Áreas Cercanas', 6);

  -- Insert Rosarito zones
  INSERT INTO public.zones (city_id, name, display_name, sort_order) VALUES
  (rosarito_id, 'centro_rosarito', 'Centro de Rosarito', 1),
  (rosarito_id, 'playas_rosarito', 'Playas de Rosarito', 2),
  (rosarito_id, 'primo_tapia', 'Primo Tapia', 3);

  -- Insert Tecate zones
  INSERT INTO public.zones (city_id, name, display_name, sort_order) VALUES
  (tecate_id, 'centro_tecate', 'Centro de Tecate', 1),
  (tecate_id, 'lomas_agua_caliente', 'Lomas de Agua Caliente', 2),
  (tecate_id, 'valle_palmas', 'Valle de Las Palmas', 3);
END $$;

-- Now populate locations with colonias for each zone
DO $$
DECLARE
  tijuana_id UUID;
  rosarito_id UUID;
  tecate_id UUID;
  centro_zona_centro_id UUID;
  zona_rio_id UUID;
  playas_costa_id UUID;
  otay_mesa_id UUID;
  cinco_diez_id UUID;
  villa_fontana_id UUID;
  centro_rosarito_id UUID;
  playas_rosarito_id UUID;
  primo_tapia_id UUID;
  centro_tecate_id UUID;
  lomas_tecate_id UUID;
  valle_palmas_id UUID;
BEGIN
  -- Get city IDs
  SELECT id INTO tijuana_id FROM public.cities WHERE name = 'Tijuana';
  SELECT id INTO rosarito_id FROM public.cities WHERE name = 'Rosarito';
  SELECT id INTO tecate_id FROM public.cities WHERE name = 'Tecate';

  -- Get zone IDs
  SELECT id INTO centro_zona_centro_id FROM public.zones WHERE name = 'centro_zona_centro';
  SELECT id INTO zona_rio_id FROM public.zones WHERE name = 'zona_rio_alrededores';
  SELECT id INTO playas_costa_id FROM public.zones WHERE name = 'playas_costa_oeste';
  SELECT id INTO otay_mesa_id FROM public.zones WHERE name = 'otay_mesa_sureste';
  SELECT id INTO cinco_diez_id FROM public.zones WHERE name = 'cinco_diez_este_central';
  SELECT id INTO villa_fontana_id FROM public.zones WHERE name = 'villa_fontana_areas_cercanas';
  SELECT id INTO centro_rosarito_id FROM public.zones WHERE name = 'centro_rosarito';
  SELECT id INTO playas_rosarito_id FROM public.zones WHERE name = 'playas_rosarito';
  SELECT id INTO primo_tapia_id FROM public.zones WHERE name = 'primo_tapia';
  SELECT id INTO centro_tecate_id FROM public.zones WHERE name = 'centro_tecate';
  SELECT id INTO lomas_tecate_id FROM public.zones WHERE name = 'lomas_agua_caliente';
  SELECT id INTO valle_palmas_id FROM public.zones WHERE name = 'valle_palmas';

  -- Clear existing locations data
  DELETE FROM public.locations;

  -- Insert Tijuana colonias
  -- Centro / Zona Centro
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, centro_zona_centro_id, 'Centro', 'Centro', 'Tijuana', 'Baja California'),
  (tijuana_id, centro_zona_centro_id, 'Zona Centro', 'Zona Centro', 'Tijuana', 'Baja California'),
  (tijuana_id, centro_zona_centro_id, 'Zona Centro Histórico', 'Zona Centro Histórico', 'Tijuana', 'Baja California'),
  (tijuana_id, centro_zona_centro_id, 'Zona Norte', 'Zona Norte', 'Tijuana', 'Baja California'),
  (tijuana_id, centro_zona_centro_id, 'Chapultepec', 'Chapultepec', 'Tijuana', 'Baja California');

  -- Zona Río y Alrededores
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, zona_rio_id, 'Zona Río', 'Zona Río', 'Tijuana', 'Baja California'),
  (tijuana_id, zona_rio_id, 'Agua Caliente', 'Agua Caliente', 'Tijuana', 'Baja California'),
  (tijuana_id, zona_rio_id, 'Lomas de Agua Caliente', 'Lomas de Agua Caliente', 'Tijuana', 'Baja California'),
  (tijuana_id, zona_rio_id, 'Valle Verde', 'Valle Verde', 'Tijuana', 'Baja California'),
  (tijuana_id, zona_rio_id, 'Cacho', 'Cacho', 'Tijuana', 'Baja California');

  -- Playas / Costa Oeste
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, playas_costa_id, 'Playas de Tijuana', 'Playas de Tijuana', 'Tijuana', 'Baja California'),
  (tijuana_id, playas_costa_id, 'Santa Fe', 'Santa Fe', 'Tijuana', 'Baja California'),
  (tijuana_id, playas_costa_id, 'Soler', 'Soler', 'Tijuana', 'Baja California'),
  (tijuana_id, playas_costa_id, 'La Jolla', 'La Jolla', 'Tijuana', 'Baja California');

  -- Otay Mesa y Sureste
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, otay_mesa_id, 'Otay', 'Otay', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Camino Verde', 'Camino Verde', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Sánchez Taboada', 'Sánchez Taboada', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'La Joya', 'La Joya', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'La Cacho', 'La Cacho', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Buenos Aires Norte', 'Buenos Aires Norte', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Buenos Aires Sur', 'Buenos Aires Sur', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Mesa de Otay', 'Mesa de Otay', 'Tijuana', 'Baja California'),
  (tijuana_id, otay_mesa_id, 'Jardín Dorado', 'Jardín Dorado', 'Tijuana', 'Baja California');

  -- 5 y 10 / Este Central
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, cinco_diez_id, '5 y 10', '5 y 10', 'Tijuana', 'Baja California'),
  (tijuana_id, cinco_diez_id, 'La Mesa', 'La Mesa', 'Tijuana', 'Baja California'),
  (tijuana_id, cinco_diez_id, 'Terrazas', 'Terrazas', 'Tijuana', 'Baja California'),
  (tijuana_id, cinco_diez_id, 'El Refugio', 'El Refugio', 'Tijuana', 'Baja California');

  -- Villa Fontana y Áreas Cercanas
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tijuana_id, villa_fontana_id, 'Villa Fontana', 'Villa Fontana', 'Tijuana', 'Baja California'),
  (tijuana_id, villa_fontana_id, 'Lomas Taurinas', 'Lomas Taurinas', 'Tijuana', 'Baja California');

  -- Insert Rosarito colonias
  -- Centro de Rosarito
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (rosarito_id, centro_rosarito_id, 'Centro', 'Centro', 'Rosarito', 'Baja California'),
  (rosarito_id, centro_rosarito_id, 'Plan Libertador', 'Plan Libertador', 'Rosarito', 'Baja California'),
  (rosarito_id, centro_rosarito_id, 'Ampliación Plan Libertador', 'Ampliación Plan Libertador', 'Rosarito', 'Baja California');

  -- Playas de Rosarito
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (rosarito_id, playas_rosarito_id, 'Playas', 'Playas', 'Rosarito', 'Baja California');

  -- Primo Tapia
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (rosarito_id, primo_tapia_id, 'Primo Tapia', 'Primo Tapia', 'Rosarito', 'Baja California'),
  (rosarito_id, primo_tapia_id, 'Popotla', 'Popotla', 'Rosarito', 'Baja California');

  -- Insert Tecate colonias
  -- Centro de Tecate
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tecate_id, centro_tecate_id, 'Centro', 'Centro', 'Tecate', 'Baja California');

  -- Lomas de Agua Caliente
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tecate_id, lomas_tecate_id, 'Lomas de Agua Caliente', 'Lomas de Agua Caliente', 'Tecate', 'Baja California');

  -- Valle de Las Palmas
  INSERT INTO public.locations (city_id, zone_id, name, colonia, city, state) VALUES
  (tecate_id, valle_palmas_id, 'Valle de Las Palmas', 'Valle de Las Palmas', 'Tecate', 'Baja California');
END $$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zones_updated_at
BEFORE UPDATE ON public.zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();