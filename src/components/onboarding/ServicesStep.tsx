
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Service, ServiceCategory } from '@/types/service';
import ServicesList from './ServicesList';
import { validateStep } from '@/utils/onboardingValidation';

const ServicesStep = () => {
  const { data, updateData, nextStep, prevStep, loading, currentStep } = useOnboarding();
  const [services, setServices] = useState<Service[]>(data.services.length > 0 ? data.services : [
    { name: '', price: 0, duration: 30, description: '', category: 'corte_barberia' as ServiceCategory }
  ]);

  useEffect(() => {
    if (data.services.length > 0) {
      setServices(data.services);
    }
  }, [data.services]);

  const addService = () => {
    setServices(prev => [...prev, { name: '', price: 0, duration: 30, description: '', category: 'corte_barberia' as ServiceCategory }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(prev => prev.filter((_, i) => i !== index));
    } else {
      toast.error('Debes tener al menos un servicio');
    }
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validServices = services.filter(service => 
      service.name.length >= 2 && service.price > 0
    );

    if (validServices.length === 0) {
      toast.error('Debes agregar al menos un servicio válido');
      return;
    }

    console.log('ServicesStep: handleNext called with services:', validServices);
    
    const servicesData = { services: validServices };
    
    // Update local data first
    updateData(servicesData);
    
    try {
      await nextStep(servicesData);
      console.log('ServicesStep: nextStep completed successfully');
    } catch (error) {
      console.error('ServicesStep: Error in nextStep:', error);
    }
  };

  // Create validation data with current services
  const validationData = { ...data, services };
  const isValid = validateStep(currentStep, validationData);

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Agrega tus Servicios
        </h3>
        <p className="text-muted-foreground mb-4">
          Debes agregar al menos un servicio para continuar
        </p>
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

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
          className="border-border text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          type="submit"
          disabled={!isValid || loading}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
};

export default ServicesStep;
