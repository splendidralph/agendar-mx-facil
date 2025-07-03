-- Create delegaciones table for Tijuana administrative regions
CREATE TABLE public.delegaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Tijuana',
  state TEXT NOT NULL DEFAULT 'Baja California',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add delegacion relationship to locations table
ALTER TABLE public.locations 
ADD COLUMN delegacion_id UUID REFERENCES public.delegaciones(id),
ADD COLUMN is_anchor BOOLEAN DEFAULT false,
ADD COLUMN group_label TEXT,
ADD COLUMN professional_count INTEGER DEFAULT 0;

-- Enable RLS on delegaciones
ALTER TABLE public.delegaciones ENABLE ROW LEVEL SECURITY;

-- Create policy for delegaciones (public read access)
CREATE POLICY "Anyone can view delegaciones" 
ON public.delegaciones 
FOR SELECT 
USING (is_active = true);

-- Insert Tijuana delegaciones
INSERT INTO public.delegaciones (name, city, state) VALUES
('Centro', 'Tijuana', 'Baja California'),
('Cerro Colorado', 'Tijuana', 'Baja California'),
('La Mesa', 'Tijuana', 'Baja California'),
('Rodolfo Sánchez Taboada', 'Tijuana', 'Baja California'),
('Otay Centenario', 'Tijuana', 'Baja California'),
('Playas de Tijuana', 'Tijuana', 'Baja California'),
('San Antonio de los Buenos', 'Tijuana', 'Baja California'),
('La Presa Este', 'Tijuana', 'Baja California'),
('La Presa A.L.R.', 'Tijuana', 'Baja California');

-- Clear existing Mexico City data and add Tijuana colonias
DELETE FROM public.locations WHERE city != 'Tijuana';

-- Insert Cerro Colorado colonias (launch area)
WITH cerro_colorado AS (
  SELECT id FROM public.delegaciones WHERE name = 'Cerro Colorado'
)
INSERT INTO public.locations (name, colonia, city, state, postal_code, delegacion_id, is_anchor, group_label, professional_count)
SELECT 
  colonia_data.name,
  colonia_data.name,
  'Tijuana',
  'Baja California',
  colonia_data.postal_code,
  cerro_colorado.id,
  colonia_data.is_anchor,
  colonia_data.group_label,
  colonia_data.professional_count
FROM cerro_colorado,
(VALUES 
  ('Buenos Aires Norte', '22150', true, 'Buenos Aires Norte Area', 0),
  ('Buenos Aires Sur', '22155', false, 'Buenos Aires Norte Area', 0),
  ('Infonavit Loma Bonita', '22156', false, 'Buenos Aires Norte Area', 0),
  ('Mariano Matamoros', '22157', false, 'Buenos Aires Norte Area', 0),
  ('Jardín Dorado', '22440', true, 'Jardín Dorado Area', 0),
  ('Terrazas del Valle', '22441', false, 'Jardín Dorado Area', 0),
  ('Villa Fontana', '22442', false, 'Jardín Dorado Area', 0),
  ('El Florido', '22443', false, 'Jardín Dorado Area', 0),
  ('Valle Verde', '22444', false, 'Jardín Dorado Area', 0),
  ('El Refugio', '22604', true, 'El Refugio Area', 0),
  ('Villas del Campo', '22605', false, 'El Refugio Area', 0),
  ('Real de San Francisco', '22606', false, 'El Refugio Area', 0)
) AS colonia_data(name, postal_code, is_anchor, group_label, professional_count);

-- Add trigger for updating updated_at on delegaciones
CREATE TRIGGER update_delegaciones_updated_at
  BEFORE UPDATE ON public.delegaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();