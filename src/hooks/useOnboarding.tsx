
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingData {
  step: number;
  businessName: string;
  category: string;
  bio: string;
  address: string;
  instagramHandle: string;
  username: string;
  services: Array<{
    name: string;
    price: number;
    duration: number;
    description: string;
    category: string;
  }>;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    businessName: '',
    category: '',
    bio: '',
    address: '',
    instagramHandle: '',
    username: '',
    services: []
  });

  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading provider data:', error);
        return;
      }

      if (provider) {
        setCurrentStep(provider.onboarding_step || 1);
        setData(prev => ({
          ...prev,
          step: provider.onboarding_step || 1,
          businessName: provider.business_name || '',
          category: provider.category || '',
          bio: provider.bio || '',
          address: provider.address || '',
          instagramHandle: provider.instagram_handle || '',
          username: provider.username || ''
        }));

        // Load services if they exist
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', provider.id);

        if (services && services.length > 0) {
          setData(prev => ({
            ...prev,
            services: services.map(service => ({
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              description: service.description || '',
              category: service.category
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    }
  };

  const generateUsername = (businessName: string) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 30);
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username) return false;

    try {
      const { data, error } = await supabase
        .from('providers')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        return true; // Username is available
      }

      return false; // Username is taken
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveCurrentStep = async () => {
    if (!user) return false;

    setLoading(true);
    try {
      // Check if provider exists
      const { data: existingProvider, error: fetchError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let providerId = existingProvider?.id;

      if (fetchError && fetchError.code === 'PGRST116') {
        // Create new provider
        const { data: newProvider, error: createError } = await supabase
          .from('providers')
          .insert({
            user_id: user.id,
            business_name: data.businessName,
            category: data.category,
            bio: data.bio,
            address: data.address,
            instagram_handle: data.instagramHandle,
            username: data.username,
            onboarding_step: currentStep,
            profile_completed: false
          })
          .select('id')
          .single();

        if (createError) throw createError;
        providerId = newProvider.id;
      } else if (!fetchError) {
        // Update existing provider
        const { error: updateError } = await supabase
          .from('providers')
          .update({
            business_name: data.businessName,
            category: data.category,
            bio: data.bio,
            address: data.address,
            instagram_handle: data.instagramHandle,
            username: data.username,
            onboarding_step: currentStep,
            profile_completed: currentStep >= 5
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Save services if we're on step 4 or later and have services
      if (currentStep >= 4 && data.services.length > 0 && providerId) {
        // Delete existing services
        await supabase
          .from('services')
          .delete()
          .eq('provider_id', providerId);

        // Insert new services
        const servicesToInsert = data.services.map(service => ({
          provider_id: providerId,
          name: service.name,
          price: service.price,
          duration_minutes: service.duration,
          description: service.description,
          category: service.category,
          is_active: true
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesToInsert);

        if (servicesError) throw servicesError;
      }

      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Error guardando los datos. Inténtalo de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const saved = await saveCurrentStep();
    if (saved && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      setData(prev => ({ ...prev, step: currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setData(prev => ({ ...prev, step: currentStep - 1 }));
    }
  };

  const completeOnboarding = async () => {
    if (!user) return false;

    const saved = await saveCurrentStep();
    if (!saved) return false;

    try {
      const { error } = await supabase
        .from('providers')
        .update({
          profile_completed: true,
          onboarding_step: 5
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('¡Perfil completado exitosamente!');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completando el perfil');
      return false;
    }
  };

  return {
    currentStep,
    data,
    loading,
    updateData,
    nextStep,
    prevStep,
    saveCurrentStep,
    completeOnboarding,
    generateUsername,
    checkUsernameAvailability
  };
};
