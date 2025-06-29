
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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

// Helper function to determine the correct step based on data completeness
const determineStepFromData = (data: OnboardingData): number => {
  console.log('determineStepFromData: Evaluating data:', {
    businessName: !!data.businessName,
    category: !!data.category,
    username: !!data.username,
    servicesCount: data.services.length
  });

  // Step 1: Requires business_name and category
  if (!data.businessName || !data.category) {
    console.log('determineStepFromData: Missing basic info, returning step 1');
    return 1;
  }
  
  // Step 2: If we have basic info but no username, go to contact step
  if (data.businessName && data.category && !data.username) {
    console.log('determineStepFromData: Have basic info, no username, returning step 2');
    return 2;
  }
  
  // Step 3: Requires username
  if (!data.username) {
    console.log('determineStepFromData: Missing username, returning step 3');
    return 3;
  }
  
  // Step 4: Requires at least one valid service
  const validServices = data.services.filter(service => 
    service.name && service.name.length >= 2 && service.price > 0
  );
  if (validServices.length === 0) {
    console.log('determineStepFromData: No valid services, returning step 4');
    return 4;
  }
  
  // Step 5: All data complete, show preview
  console.log('determineStepFromData: All data complete, returning step 5');
  return 5;
};

export const useOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  useEffect(() => {
    if (user && !dataLoaded) {
      console.log('useOnboarding: Loading existing data for user:', user.id);
      loadExistingData();
    }
  }, [user, dataLoaded]);

  const loadExistingData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await loadProviderData(user.id);
      
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
        
        // Determine the correct step based on data completeness
        const correctStep = determineStepFromData(loadedData);
        console.log('useOnboarding: Calculated correct step:', correctStep);
        
        // Update both data and step state
        setData({
          ...loadedData,
          step: correctStep
        });
        setCurrentStep(correctStep);
        console.log('useOnboarding: Set current step to:', correctStep);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('useOnboarding: Error loading data:', error);
      setDataLoaded(true);
    } finally {
      setLoading(false);
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
      
      // Handle authentication errors specially
      if (error.message.includes('sesión ha expirado') || error.message.includes('inicia sesión')) {
        toast.error('Tu sesión ha expirado. Redirigiendo al inicio de sesión...');
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
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
  };

  const nextStep = async (updatedData?: Partial<OnboardingData>) => {
    console.log('useOnboarding: nextStep called, current step:', currentStep);
    console.log('useOnboarding: updatedData provided:', updatedData);
    
    // If we have updated data, merge it with current data for validation and saving
    let dataForValidation = data;
    if (updatedData) {
      dataForValidation = { ...data, ...updatedData };
      console.log('useOnboarding: Using updated data for validation:', dataForValidation);
      // Update local data state immediately
      setData(dataForValidation);
    }
    
    // Validate step requirements before advancing
    const isStepValid = validateStepRequirements(currentStep, dataForValidation);
    console.log('useOnboarding: Step validation result:', isStepValid);
    if (!isStepValid) {
      console.log('useOnboarding: Step validation failed, not advancing');
      return;
    }
    
    // First save the current step with the provided data
    console.log('useOnboarding: Attempting to save current step...');
    const saved = await saveCurrentStep(dataForValidation);
    console.log('useOnboarding: Save result:', saved);
    if (!saved) {
      console.log('useOnboarding: Failed to save, not advancing step');
      return;
    }

    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      console.log('useOnboarding: Advancing to step:', newStep);
      
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
      setData(prev => ({ ...prev, step: newStep }));
      console.log('useOnboarding: Step state updated to:', newStep);
    } else {
      console.log('useOnboarding: Already at final step');
    }
  };

  const validateStepRequirements = (step: number, dataToValidate: OnboardingData): boolean => {
    console.log('validateStepRequirements: Validating step', step, 'with data:', dataToValidate);
    
    switch (step) {
      case 1:
        const step1Valid = !!(dataToValidate.businessName && dataToValidate.category);
        if (!step1Valid) {
          console.log('validateStepRequirements: Step 1 validation failed - businessName:', !!dataToValidate.businessName, 'category:', !!dataToValidate.category);
          toast.error('Por favor completa el nombre del negocio y la categoría');
        }
        console.log('validateStepRequirements: Step 1 valid:', step1Valid);
        return step1Valid;
      case 2:
        // Contact info is optional, so always pass
        console.log('validateStepRequirements: Step 2 always valid (optional fields)');
        return true;
      case 3:
        const step3Valid = !!dataToValidate.username;
        if (!step3Valid) {
          toast.error('Por favor elige un username');
        }
        console.log('validateStepRequirements: Step 3 valid:', step3Valid);
        return step3Valid;
      case 4:
        const validServices = dataToValidate.services.filter(service => 
          service.name && service.name.length >= 2 && service.price > 0
        );
        const step4Valid = validServices.length > 0;
        if (!step4Valid) {
          toast.error('Por favor agrega al menos un servicio válido');
        }
        console.log('validateStepRequirements: Step 4 valid:', step4Valid, 'validServices:', validServices.length);
        return step4Valid;
    }
    return true;
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
    loading: loading || !dataLoaded,
    updateData,
    nextStep,
    prevStep,
    saveCurrentStep,
    completeOnboarding,
    generateUsername,
    checkUsernameAvailability
  };
};
