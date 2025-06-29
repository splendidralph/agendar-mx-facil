
import { useState, useCallback } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';
import { 
  loadProviderData, 
  saveProviderData, 
  saveServices, 
  updateProviderStep,
  completeProviderOnboarding 
} from '@/services/onboardingService';
import { determineStepFromData } from '@/utils/onboardingSteps';

export const useOnboardingData = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    businessName: '',
    category: '',
    bio: '',
    address: '',
    instagramHandle: '',
    whatsappPhone: '',
    username: '',
    services: []
  });

  const loadExistingData = useCallback(async () => {
    if (!userId) {
      console.log('useOnboardingData: No userId provided');
      return 1;
    }

    if (dataLoaded) {
      console.log('useOnboardingData: Data already loaded, current step:', data.step);
      return data.step;
    }

    console.log('useOnboardingData: Loading data for user:', userId);
    setLoading(true);
    
    try {
      const result = await loadProviderData(userId);
      
      if (result) {
        const { provider, services } = result;
        
        // Build the data object from provider and services
        const loadedData: OnboardingData = {
          step: 1, // Will be calculated below
          businessName: provider.business_name || '',
          category: provider.category || '',
          bio: provider.bio || '',
          address: provider.address || '',
          instagramHandle: provider.instagram_handle || '',
          whatsappPhone: provider.whatsapp_phone || '',
          username: provider.username || '',
          services: services.map(service => ({
            name: service.name,
            price: service.price,
            duration: service.duration_minutes,
            description: service.description || '',
            category: service.category
          }))
        };
        
        // Calculate the correct step based on data completeness
        const dbStep = provider.onboarding_step || 1;
        const calculatedStep = determineStepFromData(loadedData, dbStep);
        
        console.log('useOnboardingData: DB step:', dbStep, 'Calculated step:', calculatedStep);
        
        // Use the calculated step as the source of truth
        const finalData = {
          ...loadedData,
          step: calculatedStep
        };
        
        setData(finalData);
        setDataLoaded(true);
        console.log('useOnboardingData: Loaded data successfully, final step:', calculatedStep);
        
        return calculatedStep;
      } else {
        // No existing data, start from step 1
        console.log('useOnboardingData: No existing data, starting from step 1');
        setDataLoaded(true);
        return 1;
      }
    } catch (error) {
      console.error('useOnboardingData: Error loading data:', error);
      toast.error('Error cargando datos del perfil');
      setDataLoaded(true);
      return 1;
    } finally {
      setLoading(false);
    }
  }, [userId, dataLoaded, data.step]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    console.log('useOnboardingData: Updating data with:', updates);
    setData(prev => {
      const newData = { ...prev, ...updates };
      console.log('useOnboardingData: New data state:', {
        step: newData.step,
        businessName: newData.businessName,
        category: newData.category,
        username: newData.username,
        servicesCount: newData.services?.length || 0
      });
      return newData;
    });
  }, []);

  const saveCurrentStep = useCallback(async (dataToSave?: OnboardingData, currentStep?: number) => {
    if (!userId) {
      console.log('useOnboardingData: No user, cannot save step');
      return false;
    }

    const saveData = dataToSave || data;
    const stepToSave = currentStep || data.step;
    console.log('useOnboardingData: Saving current step:', stepToSave, 'with data:', saveData);
    setLoading(true);
    
    try {
      const providerId = await saveProviderData(userId, saveData, stepToSave);

      // Save services if we're on step 4 or later and have services
      if (stepToSave >= 4 && saveData.services.length > 0 && providerId) {
        await saveServices(providerId, saveData.services);
      }

      console.log('useOnboardingData: Successfully saved step');
      return true;
    } catch (error) {
      console.error('useOnboardingData: Error saving onboarding data:', error);
      
      // Handle authentication errors specially
      if (error.message.includes('sesión ha expirado') || error.message.includes('inicia sesión')) {
        toast.error('Tu sesión ha expirado. Redirigiendo al inicio de sesión...');
        return false;
      }
      
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
  }, [userId, data]);

  const completeOnboarding = useCallback(async () => {
    if (!userId) return false;

    const saved = await saveCurrentStep();
    if (!saved) return false;

    try {
      await completeProviderOnboarding(userId);
      toast.success('¡Perfil completado exitosamente!');
      return true;
    } catch (error) {
      console.error('useOnboardingData: Error completing onboarding:', error);
      toast.error('Error completando el perfil');
      return false;
    }
  }, [userId, saveCurrentStep]);

  return {
    data,
    loading,
    dataLoaded,
    loadExistingData,
    updateData,
    saveCurrentStep,
    completeOnboarding
  };
};
