import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Provider = Database['public']['Tables']['providers']['Row'] & {
  services: Database['public']['Tables']['services']['Row'][];
  isLocal?: boolean;
  distance?: number;
};

interface LocationFilter {
  zone_id: string;
  city_id: string;
}

export const useProviderFiltering = (locationFilter?: LocationFilter) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, [locationFilter]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch providers with their services
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select(`
          *,
          services (*)
        `)
        .eq('profile_completed', true)
        .eq('is_active', true);

      if (providersError) {
        throw providersError;
      }

      if (!providersData) {
        setProviders([]);
        return;
      }

      // Filter and sort providers based on location (optional)
      const processedProviders = providersData
        .filter(provider => provider.services && provider.services.length > 0)
        .map(provider => {
          const isLocal = locationFilter ? 
            (provider.zone_id === locationFilter.zone_id ||
             provider.city_id === locationFilter.city_id) : false;

          return {
            ...provider,
            isLocal,
            distance: isLocal ? 0 : Math.random() * 10 // Mock distance for now
          };
        })
        .sort((a, b) => {
          // If location filter is provided, sort by proximity
          if (locationFilter) {
            if (a.isLocal && !b.isLocal) return -1;
            if (!a.isLocal && b.isLocal) return 1;
            return (a.distance || 0) - (b.distance || 0);
          }
          // Default sort by rating and total reviews
          if (a.rating !== b.rating) {
            return (b.rating || 0) - (a.rating || 0);
          }
          return (b.total_reviews || 0) - (a.total_reviews || 0);
        });

      setProviders(processedProviders);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Error cargando profesionales');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = useMemo(() => {
    return (category: string) => {
      if (!category || category === 'all') return providers;
      return providers.filter(provider => 
        provider.main_category_id === category ||
        provider.category === category ||
        provider.services.some(service => service.main_category_id === category)
      );
    };
  }, [providers]);

  const filterBySearch = useMemo(() => {
    return (searchTerm: string) => {
      if (!searchTerm.trim()) return providers;
      
      const term = searchTerm.toLowerCase();
      return providers.filter(provider =>
        provider.business_name?.toLowerCase().includes(term) ||
        provider.bio?.toLowerCase().includes(term) ||
        provider.address?.toLowerCase().includes(term) ||
        provider.services.some(service => 
          service.name.toLowerCase().includes(term) ||
          service.description?.toLowerCase().includes(term)
        )
      );
    };
  }, [providers]);

  return {
    providers,
    loading,
    error,
    filterByCategory,
    filterBySearch,
    refetch: fetchProviders
  };
};