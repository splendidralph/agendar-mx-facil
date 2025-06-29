
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export const validateStepRequirements = (step: number, dataToValidate: OnboardingData): boolean => {
  console.log('validateStepRequirements: Validating step', step, 'with data:', {
    businessName: dataToValidate.businessName,
    category: dataToValidate.category,
    username: dataToValidate.username,
    servicesCount: dataToValidate.services?.length || 0
  });
  
  switch (step) {
    case 1:
      const step1Valid = !!(dataToValidate.businessName && dataToValidate.businessName.trim() && dataToValidate.category);
      if (!step1Valid) {
        console.log('validateStepRequirements: Step 1 validation failed');
        toast.error('Por favor completa el nombre del negocio y la categoría');
      }
      return step1Valid;
      
    case 2:
      // Contact info is optional, so always pass
      console.log('validateStepRequirements: Step 2 always valid (optional fields)');
      return true;
      
    case 3:
      const step3Valid = !!(dataToValidate.username && dataToValidate.username.trim() && dataToValidate.username.length >= 3);
      if (!step3Valid) {
        console.log('validateStepRequirements: Step 3 validation failed - username:', dataToValidate.username);
        toast.error('Por favor elige un username válido');
      }
      return step3Valid;
      
    case 4:
      const validServices = (dataToValidate.services || []).filter(service => 
        service.name && service.name.trim().length >= 2 && service.price > 0
      );
      const step4Valid = validServices.length > 0;
      if (!step4Valid) {
        console.log('validateStepRequirements: Step 4 validation failed');
        toast.error('Por favor agrega al menos un servicio válido');
      }
      return step4Valid;
  }
  
  return true;
};
