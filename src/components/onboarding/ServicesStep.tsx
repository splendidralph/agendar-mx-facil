
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type ServiceCategory = Database['public']['Enums']['service_category'];

interface Service {
  name: string;
  price: number;
  duration: number;
  description: string;
  category: ServiceCategory;
}

const ServicesStep = () => {
  const { data, updateData, nextStep, prevStep, loading } = useOnboarding();
  const [services, setServices] = useState<Service[]>(data.services.length > 0 ? data.services : [
    { name: '', price: 0, duration: 30, description: '', category: 'corte_barberia' as ServiceCategory }
  ]);

  useEffect(() => {
    if (data.services.length > 0) {
      setServices(data.services);
    }
  }, [data.services]);

  const categories: ServiceCategory[] = [
    'corte_barberia',
    'unas',
    'maquillaje_cejas',
    'cuidado_facial',
    'masajes_relajacion',
    'color_alisado'
  ];

  const categoryLabels: Record<ServiceCategory, string> = {
    corte_barberia: 'Corte y Barbería',
    unas: 'Uñas y Manicure',
    maquillaje_cejas: 'Maquillaje y Cejas',
    cuidado_facial: 'Cuidado Facial',
    masajes_relajacion: 'Masajes y Relajación',
    color_alisado: 'Color y Alisado'
  };

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

  const handleNext = async () => {
    const validServices = services.filter(service => 
      service.name.length >= 2 && service.price > 0
    );

    if (validServices.length === 0) {
      toast.error('Debes agregar al menos un servicio válido');
      return;
    }

    updateData({ services: validServices });
    await nextStep();
  };

  const isValid = services.some(service => service.name.length >= 2 && service.price > 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Agrega tus Servicios
        </h3>
        <p className="text-muted-foreground mb-4">
          Debes agregar al menos un servicio para continuar
        </p>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Servicio {index + 1}</CardTitle>
                {services.length > 1 && (
                  <Button
                    onClick={() => removeService(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`service-name-${index}`}>Nombre del Servicio *</Label>
                  <Input
                    id={`service-name-${index}`}
                    value={service.name}
                    onChange={(e) => updateService(index, 'name', e.target.value)}
                    placeholder="Ej: Corte de cabello clásico"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`service-category-${index}`}>Categoría</Label>
                  <Select
                    value={service.category}
                    onValueChange={(value: ServiceCategory) => updateService(index, 'category', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {categoryLabels[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`service-price-${index}`}>Precio (MXN) *</Label>
                  <Input
                    id={`service-price-${index}`}
                    type="number"
                    min="1"
                    value={service.price || ''}
                    onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                    placeholder="150"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`service-duration-${index}`}>Duración (minutos)</Label>
                  <Select
                    value={service.duration.toString()}
                    onValueChange={(value) => updateService(index, 'duration', parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1.5 horas</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor={`service-description-${index}`}>Descripción</Label>
                <Textarea
                  id={`service-description-${index}`}
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  placeholder="Describe el servicio y qué incluye..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={addService}
        variant="outline"
        className="w-full border-border text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar Otro Servicio
      </Button>

      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          variant="outline"
          className="border-border text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid || loading}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ServicesStep;
