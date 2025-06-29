
import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export const validateStepRequirements = (step: number, dataToValidate: OnboardingData): boolean => {
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
