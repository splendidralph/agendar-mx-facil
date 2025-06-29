
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Enums']['service_category'];

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
    category: ServiceCategory;
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
      console.log('useOnboarding: Loading existing data for user:', user.id);
      loadExistingData();
    }
  }, [user]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      console.log('useOnboarding: Fetching provider data for user:', user.id);
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
        console.log('useOnboarding: Found existing provider data:', provider);
        const step = provider.onboarding_step || 1;
        setCurrentStep(step);
        setData(prev => ({
          ...prev,
          step: step,
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
          console.log('useOnboarding: Found existing services:', services);
          setData(prev => ({
            ...prev,
            services: services.map(service => ({
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              description: service.description || '',
              category: service.category as ServiceCategory
            }))
          }));
        }
      } else {
        console.log('useOnboarding: No existing provider data found');
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
    console.log('useOnboarding: Updating data with:', updates);
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveCurrentStep = async () => {
    if (!user) {
      console.log('useOnboarding: No user, cannot save step');
      return false;
    }

    console.log('useOnboarding: Saving current step:', currentStep, 'with data:', data);
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
        console.log('useOnboarding: Creating new provider');
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

        if (createError) {
          console.error('useOnboarding: Error creating provider:', createError);
          throw createError;
        }
        providerId = newProvider.id;
        console.log('useOnboarding: Created new provider with ID:', providerId);
      } else if (!fetchError) {
        console.log('useOnboarding: Updating existing provider with ID:', providerId);
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

        if (updateError) {
          console.error('useOnboarding: Error updating provider:', updateError);
          throw updateError;
        }
      }

      // Save services if we're on step 4 or later and have services
      if (currentStep >= 4 && data.services.length > 0 && providerId) {
        console.log('useOnboarding: Saving services for provider:', providerId);
        // Delete existing services
        await supabase
          .from('services')
          .delete()
          .eq('provider_id', providerId);

        // Insert new services with proper typing
        const servicesToInsert = data.services.map(service => ({
          provider_id: providerId,
          name: service.name,
          price: service.price,
          duration_minutes: service.duration,
          description: service.description,
          category: service.category as ServiceCategory,
          is_active: true
        }));

        const { error: servicesError } = await supabase
          .from('services')
          .insert(servicesToInsert);

        if (servicesError) {
          console.error('useOnboarding: Error saving services:', servicesError);
          throw servicesError;
        }
        console.log('useOnboarding: Successfully saved services');
      }

      console.log('useOnboarding: Successfully saved step');
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
    console.log('useOnboarding: nextStep called, current step:', currentStep);
    
    // First save the current step
    const saved = await saveCurrentStep();
    if (!saved) {
      console.log('useOnboarding: Failed to save, not advancing step');
      return;
    }

    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      console.log('useOnboarding: Moving to next step:', newStep);
      
      // Update the step in the database immediately
      if (user) {
        try {
          const { error } = await supabase
            .from('providers')
            .update({ onboarding_step: newStep })
            .eq('user_id', user.id);
            
          if (error) {
            console.error('useOnboarding: Error updating step in database:', error);
            return;
          }
        } catch (error) {
          console.error('useOnboarding: Error updating step:', error);
          return;
        }
      }
      
      setCurrentStep(newStep);
      setData(prev => ({ ...prev, step: newStep }));
    } else {
      console.log('useOnboarding: Already at final step');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log('useOnboarding: Moving to previous step:', newStep);
      setCurrentStep(newStep);
      setData(prev => ({ ...prev, step: newStep }));
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
