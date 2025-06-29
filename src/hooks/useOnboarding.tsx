
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { generateUsername, checkUsernameAvailability } from '@/utils/usernameUtils';
import { 
  loadProviderData, 
  saveProviderData, 
  saveServices, 
  updateProviderStep,
  completeProviderOnboarding 
} from '@/services/onboardingService';

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

    const result = await loadProviderData(user.id);
    
    if (result) {
      const { provider, services } = result;
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
        username: provider.username || '',
        services: services.map(service => ({
          name: service.name,
          price: service.price,
          duration: service.duration_minutes,
          description: service.description || '',
          category: service.category
        }))
      }));
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
      const providerId = await saveProviderData(user.id, data, currentStep);

      // Save services if we're on step 4 or later and have services
      if (currentStep >= 4 && data.services.length > 0 && providerId) {
        await saveServices(providerId, data.services);
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
          await updateProviderStep(user.id, newStep);
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
      await completeProviderOnboarding(user.id);
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
