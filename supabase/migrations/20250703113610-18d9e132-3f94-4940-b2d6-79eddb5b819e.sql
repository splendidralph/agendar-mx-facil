-- Phase 1: Hyperlocal Colonia Network - Database Schema Updates

-- Extend locations table to support colonia-level granularity
ALTER TABLE public.locations 
ADD COLUMN colonia TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN latitude DECIMAL(10,8),
ADD COLUMN longitude DECIMAL(11,8),
ADD COLUMN municipality TEXT;

-- Create index for faster postal code lookups
CREATE INDEX idx_locations_postal_code ON public.locations(postal_code);
CREATE INDEX idx_locations_colonia ON public.locations(colonia);

-- Add colonia and location preferences to providers table
ALTER TABLE public.providers 
ADD COLUMN colonia TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN latitude DECIMAL(10,8),
ADD COLUMN longitude DECIMAL(11,8),
ADD COLUMN service_radius_km INTEGER DEFAULT 5,
ADD COLUMN prefers_local_clients BOOLEAN DEFAULT true;

-- Create index for geospatial queries
CREATE INDEX idx_providers_location ON public.providers(latitude, longitude);
CREATE INDEX idx_providers_colonia ON public.providers(colonia);
CREATE INDEX idx_providers_postal_code ON public.providers(postal_code);

-- Create a function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 DECIMAL, lng1 DECIMAL, 
  lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a view for providers with location info
CREATE VIEW public.providers_with_location AS
SELECT 
  p.*,
  l.name as location_name,
  l.city,
  l.state,
  l.colonia as location_colonia,
  l.postal_code as location_postal_code
FROM public.providers p
LEFT JOIN public.locations l ON p.location_id = l.id;

-- Insert some initial Mexico City colonias for testing
INSERT INTO public.locations (name, city, state, colonia, postal_code, municipality) VALUES
('Roma Norte', 'Ciudad de México', 'CDMX', 'Roma Norte', '06700', 'Cuauhtémoc'),
('Condesa', 'Ciudad de México', 'CDMX', 'Condesa', '06140', 'Cuauhtémoc'),
('Polanco', 'Ciudad de México', 'CDMX', 'Polanco', '11560', 'Miguel Hidalgo'),
('Coyoacán Centro', 'Ciudad de México', 'CDMX', 'Coyoacán Centro', '04000', 'Coyoacán'),
('San Ángel', 'Ciudad de México', 'CDMX', 'San Ángel', '01000', 'Álvaro Obregón'),
('Santa Fe', 'Ciudad de México', 'CDMX', 'Santa Fe', '01210', 'Álvaro Obregón'),
('Del Valle', 'Ciudad de México', 'CDMX', 'Del Valle', '03100', 'Benito Juárez'),
('Narvarte', 'Ciudad de México', 'CDMX', 'Narvarte', '03020', 'Benito Juárez'),
('Doctores', 'Ciudad de México', 'CDMX', 'Doctores', '06720', 'Cuauhtémoc'),
('Escandón', 'Ciudad de México', 'CDMX', 'Escandón', '11800', 'Miguel Hidalgo')
ON CONFLICT DO NOTHING;