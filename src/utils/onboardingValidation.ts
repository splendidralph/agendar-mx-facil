import { OnboardingData } from '@/types/onboarding';
import { toast } from 'sonner';

export const validateStep = (step: number, data: OnboardingData): boolean => {
  console.log('validateStep: Validating step', step, 'with data:', {
    businessName: data.businessName,
    category: data.category,
    username: data.username,
    servicesCount: data.services?.length || 0
  });
  
  switch (step) {
    case 1:
      // Enhanced validation for business name
      if (!data.businessName || !data.businessName.trim()) {
        toast.error('El nombre del negocio es requerido');
        return false;
      }
      if (data.businessName.length < 2 || data.businessName.length > 100) {
        toast.error('El nombre del negocio debe tener entre 2 y 100 caracteres');
        return false;
      }
      if (!data.category) {
        toast.error('La categoría es requerida');
        return false;
      }
      console.log('validateStep: Step 1 validation passed');
      return true;
      
    case 2:
      // Enhanced validation for contact step
      if (data.whatsappPhone && !/^\+?[1-9]\d{1,14}$/.test(data.whatsappPhone)) {
        toast.error('El formato del número de WhatsApp no es válido');
        return false;
      }
      if (data.instagramHandle && !/^[a-zA-Z0-9_.]{1,30}$/.test(data.instagramHandle)) {
        toast.error('El formato del Instagram no es válido (solo letras, números, puntos y guiones bajos)');
        return false;
      }
      if (data.postalCode && !/^\d{5}$/.test(data.postalCode)) {
        toast.error('El código postal debe tener 5 dígitos');
        return false;
      }
      console.log('validateStep: Step 2 validation passed');
      return true;
      
    case 3:
      // Enhanced validation for username
      if (!data.username || !data.username.trim()) {
        toast.error('El nombre de usuario es requerido');
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
      console.log('validateStep: Step 3 validation passed');
      return true;
      
    case 4:
      // Enhanced validation for services
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
      
      console.log('validateStep: Step 4 validation passed');
      return true;
      
    default:
      console.log('validateStep: Default case, returning true for step', step);
      return true;
  }
};

// Keep the old function name for backward compatibility
export const validateStepRequirements = validateStep;
