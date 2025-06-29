import { OnboardingData } from '@/types/onboarding';

export const validateStep = (step: number, data: OnboardingData): boolean => {
  console.log('validateStep: Validating step', step, 'with data:', {
    businessName: data.businessName,
    category: data.category,
    username: data.username,
    servicesCount: data.services?.length || 0
  });
  
  switch (step) {
    case 1:
      const step1Valid = !!(data.businessName && data.businessName.trim() && data.category);
      console.log('validateStep: Step 1 validation result:', step1Valid);
      return step1Valid;
      
    case 2:
      // Contact info is optional, so always pass
      console.log('validateStep: Step 2 always valid (optional fields)');
      return true;
      
    case 3:
      const step3Valid = !!(data.username && data.username.trim() && data.username.length >= 3);
      console.log('validateStep: Step 3 validation result:', step3Valid);
      return step3Valid;
      
    case 4:
      const validServices = (data.services || []).filter(service => 
        service.name && service.name.trim().length >= 2 && service.price > 0
      );
      const step4Valid = validServices.length > 0;
      console.log('validateStep: Step 4 validation result:', step4Valid, 'valid services:', validServices.length);
      return step4Valid;
      
    default:
      console.log('validateStep: Default case, returning true for step', step);
      return true;
  }
};

// Keep the old function name for backward compatibility
export const validateStepRequirements = validateStep;
