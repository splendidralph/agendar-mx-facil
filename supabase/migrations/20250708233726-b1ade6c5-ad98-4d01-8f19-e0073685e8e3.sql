-- Fix location data issues: Populate missing city_id and zone_id for existing providers
-- This migration maps existing colonia values to proper city_id and zone_id references

-- Create a temporary function to map colonias to zones
DO $$
DECLARE
  tijuana_id UUID;
  zona_rio_id UUID;
  provider_record RECORD;
BEGIN
  -- Get Tijuana city ID
  SELECT id INTO tijuana_id FROM public.cities WHERE name = 'Tijuana';
  
  -- Get Zona Río zone ID (most common for existing providers)
  SELECT id INTO zona_rio_id FROM public.zones 
  WHERE city_id = tijuana_id AND name = 'zona_rio_alrededores';
  
  -- Update providers with missing location data
  -- Map common colonias to appropriate city/zone combinations
  FOR provider_record IN 
    SELECT id, colonia FROM public.providers 
    WHERE profile_completed = true 
    AND (city_id IS NULL OR zone_id IS NULL)
    AND colonia IS NOT NULL
  LOOP
    -- Default mapping logic based on colonia name
    IF provider_record.colonia ILIKE '%zona río%' OR 
       provider_record.colonia ILIKE '%zona rio%' OR
       provider_record.colonia ILIKE '%agua caliente%' THEN
      UPDATE public.providers 
      SET city_id = tijuana_id, zone_id = zona_rio_id
      WHERE id = provider_record.id;
      
    ELSIF provider_record.colonia ILIKE '%centro%' THEN
      UPDATE public.providers 
      SET city_id = tijuana_id, 
          zone_id = (SELECT id FROM public.zones WHERE city_id = tijuana_id AND name = 'centro_zona_centro')
      WHERE id = provider_record.id;
      
    ELSIF provider_record.colonia ILIKE '%playas%' THEN
      UPDATE public.providers 
      SET city_id = tijuana_id, 
          zone_id = (SELECT id FROM public.zones WHERE city_id = tijuana_id AND name = 'playas_costa_oeste')
      WHERE id = provider_record.id;
      
    ELSIF provider_record.colonia ILIKE '%otay%' THEN
      UPDATE public.providers 
      SET city_id = tijuana_id, 
          zone_id = (SELECT id FROM public.zones WHERE city_id = tijuana_id AND name = 'otay_mesa_sureste')
      WHERE id = provider_record.id;
      
    ELSE
      -- Default to Zona Río for unmatched colonias
      UPDATE public.providers 
      SET city_id = tijuana_id, zone_id = zona_rio_id
      WHERE id = provider_record.id;
    END IF;
  END LOOP;
  
  -- Also handle providers with NULL colonia but missing city/zone
  UPDATE public.providers 
  SET city_id = tijuana_id, zone_id = zona_rio_id, colonia = 'Zona Río'
  WHERE profile_completed = true 
  AND (city_id IS NULL OR zone_id IS NULL)
  AND colonia IS NULL;
  
END $$;

-- Create index for better performance on location queries
CREATE INDEX IF NOT EXISTS idx_providers_location ON public.providers(city_id, zone_id);
CREATE INDEX IF NOT EXISTS idx_locations_zone ON public.locations(zone_id);