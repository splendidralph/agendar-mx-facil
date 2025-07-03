import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Service, ServiceCategory } from '@/types/service';
import ServicesList from '../ServicesList';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';

interface ServicesStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const ServicesStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false,
  validationErrors 
}: ServicesStepProps) => {
  const [services, setServices] = useState<Service[]>(
    data.services.length > 0 
      ? data.services 
      : [{ name: '', price: 0, duration: 30, description: '', category: 'corte_barberia' as ServiceCategory }]
  );

  const addService = () => {
    const newService: Service = { 
      name: '', 
      price: 0, 
      duration: 30, 
      description: '', 
      category: 'corte_barberia' as ServiceCategory 
    };
    const newServices = [...services, newService];
    setServices(newServices);
    onUpdate({ services: newServices });
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index);
      setServices(newServices);
      onUpdate({ services: newServices });
    } else {
      toast.error('Debes tener al menos un servicio');
    }
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(newServices);
    onUpdate({ services: newServices });
  };

  const handleNext = async () => {
    const validServices = services.filter(service => 
      service.name.length >= 2 && service.price > 0
    );

    if (validServices.length === 0) {
      toast.error('Debes agregar al menos un servicio válido');
      return;
    }

    await onNext({ services: validServices });
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const isValid = services.some(service => 
    service.name.length >= 2 && service.price > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Agrega tus Servicios
        </h3>
        <p className="text-muted-foreground mb-4">
          Debes agregar al menos un servicio para continuar
        </p>
        {getFieldError('services') && (
          <p className="text-sm text-red-500 mb-4">{getFieldError('services')}</p>
        )}
      </div>

      <ServicesList
        services={services}
        onUpdate={updateService}
        onRemove={removeService}
      />

      <Button
        type="button"
        onClick={addService}
        variant="outline"
        className="w-full border-border text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Otro Servicio
      </Button>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={isValid}
        loading={loading}
      />
    </div>
  );
};