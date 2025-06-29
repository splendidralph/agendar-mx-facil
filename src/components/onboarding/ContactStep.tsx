
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ContactStep = () => {
  const { data, updateData, nextStep, prevStep, loading } = useOnboarding();
  const [formData, setFormData] = useState({
    address: data.address,
    instagramHandle: data.instagramHandle
  });

  useEffect(() => {
    setFormData({
      address: data.address,
      instagramHandle: data.instagramHandle
    });
  }, [data]);

  const handleNext = async () => {
    console.log('ContactStep: handleNext called with formData:', formData);
    
    // Update local data first
    updateData(formData);
    
    // Pass the form data directly to nextStep to ensure it's saved correctly
    try {
      await nextStep(formData);
      console.log('ContactStep: nextStep completed successfully');
    } catch (error) {
      console.error('ContactStep: Error in nextStep:', error);
    }
  };

  const handleInstagramChange = (value: string) => {
    // Remove @ symbol if user adds it
    const cleanValue = value.replace('@', '');
    setFormData(prev => ({ ...prev, instagramHandle: cleanValue }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="address">Dirección del Negocio</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Ej: Av. Principal 123, Colonia Centro"
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Ayuda a los clientes a encontrarte (opcional)
        </p>
      </div>

      <div>
        <Label htmlFor="instagram">Instagram</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <Input
            id="instagram"
            value={formData.instagramHandle}
            onChange={(e) => handleInstagramChange(e.target.value)}
            placeholder="tu_instagram"
            className="pl-8"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Conecta con tus clientes en redes sociales (opcional)
        </p>
      </div>

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
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ContactStep;
