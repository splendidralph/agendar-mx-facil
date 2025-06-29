
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
      console.log('useOnboarding: Setting step to:', step);
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
    setData(prev => {
      const newData = { ...prev, ...updates };
      console.log('useOnboarding: New data state:', newData);
      return newData;
    });
  };

  const saveCurrentStep = async (dataToSave?: OnboardingData) => {
    if (!user) {
      console.log('useOnboarding: No user, cannot save step');
      return false;
    }

    const saveData = dataToSave || data;
    console.log('useOnboarding: Saving current step:', currentStep, 'with data:', saveData);
    setLoading(true);
    
    try {
      const providerId = await saveProviderData(user.id, saveData, currentStep);

      // Save services if we're on step 4 or later and have services
      if (currentStep >= 4 && saveData.services.length > 0 && providerId) {
        await saveServices(providerId, saveData.services);
      }

      console.log('useOnboarding: Successfully saved step');
      return true;
    } catch (error) {
      console.error('useOnboarding: Error saving onboarding data:', error);
      // More specific error messages
      if (error.message.includes('duplicate key')) {
        toast.error('El username ya está en uso. Por favor elige otro.');
      } else if (error.message.includes('violates check constraint')) {
        toast.error('Por favor completa todos los campos requeridos.');
      } else {
        toast.error('Error guardando los datos. Inténtalo de nuevo.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async (updatedData?: Partial<OnboardingData>) => {
    console.log('useOnboarding: nextStep called, current step:', currentStep);
    
    // If we have updated data, merge it with current data for saving
    let dataForSaving = data;
    if (updatedData) {
      dataForSaving = { ...data, ...updatedData };
      console.log('useOnboarding: Using updated data for saving:', dataForSaving);
    }
    
    console.log('useOnboarding: Data to save:', dataForSaving);
    
    // First save the current step with the provided data
    const saved = await saveCurrentStep(dataForSaving);
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
          console.log('useOnboarding: Successfully updated step in database');
        } catch (error) {
          console.error('useOnboarding: Error updating step:', error);
          toast.error('Error avanzando al siguiente paso');
          return;
        }
      }
      
      setCurrentStep(newStep);
      // Update local data state with the provided updates
      if (updatedData) {
        setData(prev => ({ ...prev, ...updatedData, step: newStep }));
      } else {
        setData(prev => ({ ...prev, step: newStep }));
      }
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
