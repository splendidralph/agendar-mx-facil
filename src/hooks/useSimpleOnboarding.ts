
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { validateStep } from '@/utils/onboardingValidation';
import { 
  loadProviderData, 
  saveProviderData, 
  saveServices,
  completeProviderOnboarding 
} from '@/services/onboardingService';

export const useSimpleOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Simple state - no complex syncing
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    step: 1,
    businessName: '',
    category: '',
    bio: '',
    address: '',
    instagramHandle: '',
    whatsappPhone: '',
    username: '',
    colonia: '',
    postalCode: '',
    latitude: undefined,
    longitude: undefined,
    serviceRadiusKm: 5,
    prefersLocalClients: true,
    services: []
  });

  // Load data once on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await loadProviderData(user.id);
        
        if (result) {
          const { provider, services } = result;
          
          const loadedData: OnboardingData = {
            step: provider.onboarding_step || 1,
            businessName: provider.business_name || '',
            category: provider.category || '',
            bio: provider.bio || '',
            address: provider.address || '',
            instagramHandle: provider.instagram_handle || '',
            whatsappPhone: provider.whatsapp_phone || '',
            username: provider.username || '',
            colonia: provider.colonia || '',
            postalCode: provider.postal_code || '',
            latitude: provider.latitude || undefined,
            longitude: provider.longitude || undefined,
            serviceRadiusKm: provider.service_radius_km || 5,
            prefersLocalClients: provider.prefers_local_clients !== false,
            services: services.map(service => ({
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              description: service.description || '',
              category: service.category
            }))
          };
          
          setData(loadedData);
          setCurrentStep(loadedData.step);
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        toast.error('Error cargando datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Simple data update
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  // Simple next step function
  const nextStep = useCallback(async (formData?: Partial<OnboardingData>) => {
    if (!user?.id) {
      toast.error('Error: Usuario no identificado');
      return;
    }

    // Merge form data with current data for validation
    const dataToValidate = { ...data, ...formData };
    
    // Validate current step
    if (!validateStep(currentStep, dataToValidate)) {
      return; // validateStep will show appropriate error
    }

    setLoading(true);
    
    try {
      // Update local data first
      if (formData) {
        setData(prev => ({ ...prev, ...formData }));
      }

      // Save to database
      const providerId = await saveProviderData(user.id, dataToValidate, currentStep);

      // Save services if we're on step 4 or later
      if (currentStep >= 4 && dataToValidate.services.length > 0 && providerId) {
        await saveServices(providerId, dataToValidate.services);
      }

      // Move to next step
      if (currentStep < 5) {
        const nextStepNumber = currentStep + 1;
        setCurrentStep(nextStepNumber);
        setData(prev => ({ ...prev, step: nextStepNumber }));
      }
      
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Error guardando los datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [currentStep, data, user?.id]);

  // Simple previous step function
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      setData(prev => ({ ...prev, step: prevStepNumber }));
    }
  }, [currentStep]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      await completeProviderOnboarding(user.id);
      toast.success('¡Perfil completado exitosamente!');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completando el perfil');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    currentStep,
    data,
    loading,
    updateData,
    nextStep,
    prevStep,
    completeOnboarding
  };
};
