import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { 
  loadProviderData, 
  saveProviderData, 
  saveServices,
  completeProviderOnboarding 
} from '@/services/onboardingService';

interface ValidationError {
  field: string;
  message: string;
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  loading: boolean;
  saving: boolean;
  validationErrors: ValidationError[];
}

const initialData: OnboardingData = {
  step: 1,
  businessName: '',
  category: '',
  bio: '',
  address: '',
  instagramHandle: '',
  whatsappPhone: '',
  username: '',
  services: []
};

export const useOnboardingFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    data: initialData,
    loading: true,
    saving: false,
    validationErrors: []
  });

  // Load existing data on mount
  useEffect(() => {
    if (!user?.id) return;
    
    const loadExistingData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
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
            services: services.map(service => ({
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              description: service.description || '',
              category: service.category
            }))
          };
          
          setState(prev => ({
            ...prev,
            currentStep: loadedData.step,
            data: loadedData,
            loading: false
          }));
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        toast.error('Error cargando datos del perfil');
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadExistingData();
  }, [user?.id]);

  // Validate step data
  const validateStep = useCallback((step: number, data: OnboardingData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    switch (step) {
      case 1: // Profile + Username Setup
        if (!data.businessName?.trim()) {
          errors.push({ field: 'businessName', message: 'El nombre del negocio es requerido' });
        }
        if (!data.category) {
          errors.push({ field: 'category', message: 'La categoría es requerida' });
        }
        if (!data.username?.trim()) {
          errors.push({ field: 'username', message: 'El username es requerido' });
        } else if (data.username.length < 3) {
          errors.push({ field: 'username', message: 'El username debe tener al menos 3 caracteres' });
        }
        break;
        
      case 2: // Services
        const validServices = data.services.filter(s => s.name?.trim() && s.price > 0);
        if (validServices.length === 0) {
          errors.push({ field: 'services', message: 'Debes agregar al menos un servicio válido' });
        }
        break;
        
      case 3: // Contact (optional)
        // All fields are optional, no validation needed
        break;
    }
    
    return errors;
  }, []);

  // Update form data
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      validationErrors: [] // Clear validation errors when updating
    }));
  }, []);

  // Auto-save data when modified (debounced)
  useEffect(() => {
    if (!user?.id || state.loading || state.saving) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveProviderData(user.id, state.data, state.currentStep);
      } catch (error) {
        // Silent save - don't show error for auto-save
        console.warn('Auto-save failed:', error);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [state.data, state.currentStep, user?.id, state.loading, state.saving]);

  // Navigate to next step
  const nextStep = useCallback(async (additionalData?: Partial<OnboardingData>) => {
    if (!user?.id) {
      toast.error('Error: Usuario no identificado');
      return false;
    }

    // Merge any additional data
    const dataToValidate = { ...state.data, ...additionalData };
    
    // Validate current step
    const errors = validateStep(state.currentStep, dataToValidate);
    if (errors.length > 0) {
      setState(prev => ({ ...prev, validationErrors: errors }));
      errors.forEach(error => toast.error(error.message));
      return false;
    }

    setState(prev => ({ ...prev, saving: true, validationErrors: [] }));
    
    try {
      // Update data if provided
      if (additionalData) {
        setState(prev => ({ ...prev, data: { ...prev.data, ...additionalData } }));
      }

      // Save to database
      const finalData = { ...state.data, ...additionalData };
      const providerId = await saveProviderData(user.id, finalData, state.currentStep);

      // Save services if we're on step 2 or later
      if (state.currentStep >= 2 && finalData.services.length > 0 && providerId) {
        await saveServices(providerId, finalData.services);
      }

      // Move to next step
      if (state.currentStep < 4) {
        const nextStepNumber = state.currentStep + 1;
        setState(prev => ({
          ...prev,
          currentStep: nextStepNumber,
          data: { ...prev.data, step: nextStepNumber, ...additionalData },
          saving: false
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Error guardando los datos. Inténtalo de nuevo.');
      setState(prev => ({ ...prev, saving: false }));
      return false;
    }
  }, [state.currentStep, state.data, user?.id, validateStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      const prevStepNumber = state.currentStep - 1;
      setState(prev => ({
        ...prev,
        currentStep: prevStepNumber,
        data: { ...prev.data, step: prevStepNumber },
        validationErrors: []
      }));
    }
  }, [state.currentStep]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user?.id) return false;

    setState(prev => ({ ...prev, saving: true }));
    try {
      await completeProviderOnboarding(user.id);
      toast.success('¡Perfil completado exitosamente!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completando el perfil');
      setState(prev => ({ ...prev, saving: false }));
      return false;
    }
  }, [user?.id, navigate]);

  return {
    currentStep: state.currentStep,
    data: state.data,
    loading: state.loading,
    saving: state.saving,
    validationErrors: state.validationErrors,
    updateData,
    nextStep,
    prevStep,
    completeOnboarding,
    validateStep: (step: number) => validateStep(step, state.data)
  };
};