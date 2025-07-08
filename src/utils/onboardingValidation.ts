import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export const validateStep = (step: number, data: OnboardingData): boolean => {
  console.log('validateStep: Validating step', step, 'with data:', {
    businessName: data.businessName,
    category: data.category,
    username: data.username,
    servicesCount: data.services?.length || 0
  });
  
  try {
    switch (step) {
      case 1:
        // Step 1: Profile & Business Info - Allow partial data during onboarding
        if (data.businessName && data.businessName.trim()) {
          if (data.businessName.length < 2 || data.businessName.length > 100) {
            toast.error('El nombre del negocio debe tener entre 2 y 100 caracteres');
            return false;
          }
        }
        
        if (data.category && data.category.trim()) {
          // Category is valid if provided
        }
        
        console.log('validateStep: Step 1 validation passed');
        return true;
        
      case 2:
        // Step 2: Services - Require at least one valid service
        if (!data.services || data.services.length === 0) {
          toast.error('Debes agregar al menos un servicio');
          return false;
        }
        
        for (const service of data.services) {
          if (!service.name || service.name.trim().length < 2) {
            toast.error('El nombre del servicio debe tener al menos 2 caracteres');
            return false;
          }
          if (service.name.length > 100) {
            toast.error('El nombre del servicio no puede exceder 100 caracteres');
            return false;
          }
          if (service.price <= 0) {
            toast.error('El precio del servicio debe ser mayor a 0');
            return false;
          }
          if (service.duration < 15 || service.duration > 480) {
            toast.error('La duración del servicio debe estar entre 15 y 480 minutos');
            return false;
          }
        }
        
        console.log('validateStep: Step 2 validation passed');
        return true;
        
      case 3:
        // Step 3: Contact Info - Optional fields with format validation
        if (data.whatsappPhone && data.whatsappPhone.trim() && !/^\+?[1-9]\d{1,14}$/.test(data.whatsappPhone.trim())) {
          toast.error('El formato del número de WhatsApp no es válido');
          return false;
        }
        if (data.postalCode && data.postalCode.trim() && !/^\d{5}$/.test(data.postalCode.trim())) {
          toast.error('El código postal debe tener 5 dígitos');
          return false;
        }
        console.log('validateStep: Step 3 validation passed');
        return true;
        
      case 4:
        // Step 4: Preview - Final validation before completion
        if (!data.businessName || !data.businessName.trim()) {
          toast.error('El nombre del negocio es requerido para completar el perfil');
          return false;
        }
        if (!data.category || !data.category.trim()) {
          toast.error('La categoría es requerida para completar el perfil');
          return false;
        }
        if (!data.username || !data.username.trim()) {
          toast.error('El nombre de usuario es requerido para completar el perfil');
          return false;
        }
        if (data.username.length < 3 || data.username.length > 30) {
          toast.error('El nombre de usuario debe tener entre 3 y 30 caracteres');
          return false;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
          toast.error('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
          return false;
        }
        if (!data.services || data.services.length === 0) {
          toast.error('Debes agregar al menos un servicio para completar el perfil');
          return false;
        }
        
        console.log('validateStep: Step 4 validation passed');
        return true;
        
      default:
        console.log('validateStep: Default case, returning true for step', step);
        return true;
    }
  } catch (error) {
    console.error('validateStep: Error during validation:', error);
    toast.error('Error en la validación. Por favor, inténtalo de nuevo.');
    return false;
  }
};

// Keep the old function name for backward compatibility
export const validateStepRequirements = validateStep;
