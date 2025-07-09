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
  whatsappPhone: '',
  username: '',
  // New location system fields
  city_id: '',
  zone_id: '',
  colonia: '', // Optional field now
  // Legacy location fields (keep for compatibility)
  delegacion: '',
  delegacionId: undefined,
  postalCode: '',
  groupLabel: undefined,
  latitude: undefined,
  longitude: undefined,
  serviceRadiusKm: 5,
  prefersLocalClients: true,
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
            category: provider.category || '', // Keep for backward compatibility
            mainCategory: provider.main_categories || undefined,
            subcategory: provider.subcategories || undefined,
            bio: provider.bio || '',
            address: provider.address || '',
            whatsappPhone: provider.whatsapp_phone || '',
            username: provider.username || '',
            // New location system fields
            city_id: provider.city_id || '',
            zone_id: provider.zone_id || '',
            colonia: provider.colonia || '', // Optional field now
            // Legacy location fields (keep for compatibility)
            delegacion: '', // TODO: Load from delegaciones table
            delegacionId: undefined,
            postalCode: provider.postal_code || '',
            groupLabel: undefined,
            latitude: provider.latitude || undefined,
            longitude: provider.longitude || undefined,
            serviceRadiusKm: provider.service_radius_km || 5,
            prefersLocalClients: provider.prefers_local_clients !== false,
            services: services.map(service => ({
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              description: service.description || '',
              category: service.category,
              mainCategoryId: service.main_category_id || undefined,
              subcategoryId: service.subcategory_id || undefined
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

  // Validate step data - aligned with new 4-step order
  const validateStep = useCallback((step: number, data: OnboardingData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    try {
      switch (step) {
        case 1: // Username & Bio - Require username
          if (!data.username || !data.username.trim()) {
            errors.push({ field: 'username', message: 'El nombre de usuario es requerido' });
          } else if (data.username.length < 3 || data.username.length > 30) {
            errors.push({ field: 'username', message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' });
          } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
            errors.push({ field: 'username', message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos' });
          }
          break;
          
        case 2: // Name & Category - Require both
          if (!data.businessName || !data.businessName.trim()) {
            errors.push({ field: 'businessName', message: 'Tu nombre es requerido' });
          } else if (data.businessName.length < 2 || data.businessName.length > 100) {
            errors.push({ field: 'businessName', message: 'Tu nombre debe tener entre 2 y 100 caracteres' });
          }
          
          if (!data.mainCategory) {
            errors.push({ field: 'mainCategory', message: 'Debes seleccionar una categoría principal' });
          }
          break;
          
        case 3: // Services - Require at least one valid service
          const validServices = data.services.filter(s => s.name?.trim() && s.price > 0);
          if (validServices.length === 0) {
            errors.push({ field: 'services', message: 'Debes agregar al menos un servicio válido' });
          }
          
          // Validate each service
          data.services.forEach((service, index) => {
            if (service.name && service.name.trim()) {
              if (service.name.length < 2) {
                errors.push({ field: `service_${index}_name`, message: 'El nombre del servicio debe tener al menos 2 caracteres' });
              }
              if (service.price <= 0) {
                errors.push({ field: `service_${index}_price`, message: 'El precio debe ser mayor a 0' });
              }
              if (service.duration < 15 || service.duration > 480) {
                errors.push({ field: `service_${index}_duration`, message: 'La duración debe estar entre 15 y 480 minutos' });
              }
            }
          });
          break;
          
        case 4: // Contact & Location - Require phone and location data (simplified)
          if (!data.whatsappPhone || !data.whatsappPhone.trim()) {
            errors.push({ field: 'whatsappPhone', message: 'El número de teléfono es requerido' });
          } else if (!/^\+[1-9]\d{1,14}$/.test(data.whatsappPhone.trim())) {
            errors.push({ field: 'whatsappPhone', message: 'El número debe incluir código de país (ej. +52 para México, +1 para EE.UU.)' });
          }
          
          if (!data.city_id) {
            errors.push({ field: 'city_id', message: 'Debes seleccionar una ciudad' });
          }
          
          if (!data.zone_id) {
            errors.push({ field: 'zone_id', message: 'Debes seleccionar una zona' });
          }
          
          // Note: colonia requirement removed - city and zone are sufficient
          break;
      }
    } catch (validationError) {
      console.error('validateStep: Error during validation:', validationError);
      errors.push({ field: 'general', message: 'Error en la validación de datos' });
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

  // Navigate to next step with improved error handling
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
      // Show only the first error to avoid overwhelming the user
      toast.error(errors[0].message);
      return false;
    }

    setState(prev => ({ ...prev, saving: true, validationErrors: [] }));
    
    try {
      // Update data if provided
      if (additionalData) {
        setState(prev => ({ ...prev, data: { ...prev.data, ...additionalData } }));
      }

      // Save to database with better error handling
      const finalData = { ...state.data, ...additionalData };
      let providerId;
      
      try {
        providerId = await saveProviderData(user.id, finalData, state.currentStep);
        console.log('nextStep: Provider data saved successfully, ID:', providerId);
      } catch (saveError) {
        console.error('nextStep: Error saving provider data:', saveError);
        
        // Handle specific error cases
        if (saveError.message?.includes('username')) {
          setState(prev => ({ 
            ...prev, 
            validationErrors: [{ field: 'username', message: 'Este nombre de usuario ya está en uso' }],
            saving: false 
          }));
          toast.error('Este nombre de usuario ya está en uso. Por favor, elige otro.');
        } else if (saveError.message?.includes('Tu sesión ha expirado')) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          // Could redirect to auth page here
        } else {
          toast.error('Error guardando los datos. Inténtalo de nuevo.');
        }
        
        setState(prev => ({ ...prev, saving: false }));
        return false;
      }

      // Save services if we're on step 3 or later
      if (state.currentStep >= 3 && finalData.services.length > 0 && providerId) {
        try {
          await saveServices(providerId, finalData.services);
          console.log('nextStep: Services saved successfully');
        } catch (servicesError) {
          console.error('nextStep: Error saving services:', servicesError);
          toast.error('Error guardando los servicios. Verifica los datos e inténtalo de nuevo.');
          setState(prev => ({ ...prev, saving: false }));
          return false;
        }
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
      } else {
        setState(prev => ({ ...prev, saving: false }));
      }
      
      return true;
    } catch (error) {
      console.error('nextStep: Unexpected error:', error);
      toast.error('Error inesperado. Por favor, inténtalo de nuevo.');
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