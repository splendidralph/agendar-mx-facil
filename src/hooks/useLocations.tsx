import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { City, Zone, Location } from '@/types/location';

export const useLocations = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        
        const { data: citiesData, error: citiesError } = await supabase
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (citiesError) throw citiesError;

        setCities(citiesData || []);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err instanceof Error ? err.message : 'Error fetching cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const getZonesByCity = async (cityId: string): Promise<Zone[]> => {
    try {
      const { data: zonesData, error: zonesError } = await supabase
        .from('zones')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('sort_order');

      if (zonesError) throw zonesError;

      return zonesData || [];
    } catch (err) {
      console.error('Error fetching zones:', err);
      return [];
    }
  };

  const getLocationsByZone = async (zoneId: string): Promise<Location[]> => {
    try {
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('zone_id', zoneId)
        .order('colonia');

      if (locationsError) throw locationsError;

      return locationsData || [];
    } catch (err) {
      console.error('Error fetching locations:', err);
      return [];
    }
  };

  const getCityById = (id: string): City | undefined => {
    return cities.find(city => city.id === id);
  };

  return {
    cities,
    zones,
    locations,
    loading,
    error,
    getZonesByCity,
    getLocationsByZone,
    getCityById
  };
};