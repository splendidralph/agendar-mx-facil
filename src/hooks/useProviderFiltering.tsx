import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Provider = Database['public']['Tables']['providers']['Row'] & {
  services: Database['public']['Tables']['services']['Row'][];
  isLocal?: boolean;
  distance?: number;
};

interface LocationFilter {
  colonia: string;
  postalCode: string;
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

      // Filter and sort providers based on location
      const processedProviders = providersData
        .filter(provider => provider.services && provider.services.length > 0)
        .map(provider => {
          const isLocal = locationFilter ? 
            (provider.colonia?.toLowerCase() === locationFilter.colonia.toLowerCase() ||
             provider.postal_code === locationFilter.postalCode) : false;

          return {
            ...provider,
            isLocal,
            distance: isLocal ? 0 : Math.random() * 10 // Mock distance for now
          };
        })
        .sort((a, b) => {
          // Local providers first
          if (a.isLocal && !b.isLocal) return -1;
          if (!a.isLocal && b.isLocal) return 1;
          // Then by distance
          return (a.distance || 0) - (b.distance || 0);
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
        provider.category === category ||
        provider.services.some(service => service.category === category)
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
        provider.colonia?.toLowerCase().includes(term) ||
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