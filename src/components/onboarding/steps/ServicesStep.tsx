import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      : [{ 
          name: '', 
          price: 0, 
          duration: 30, 
          description: '', 
          category: 'other' as ServiceCategory,
          mainCategoryId: data.mainCategory?.id,
          subcategoryId: data.subcategory?.id
        }]
  );

  const addService = () => {
    const newService: Service = { 
      name: '', 
      price: 0, 
      duration: 30, 
      description: '', 
      category: 'other' as ServiceCategory,
      mainCategoryId: data.mainCategory?.id,
      subcategoryId: data.subcategory?.id
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
          Agrega tus Servicios de {data.subcategory?.display_name}
        </h3>
        <p className="text-muted-foreground mb-4">
          Agrega los servicios específicos que ofreces en {data.subcategory?.display_name?.toLowerCase()}
        </p>
        {data.mainCategory && data.subcategory && (
          <div className="mb-4">
            <Badge variant="secondary" className="mr-2">
              {data.mainCategory.display_name}
            </Badge>
            <Badge variant="outline">
              {data.subcategory.display_name}
            </Badge>
          </div>
        )}
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