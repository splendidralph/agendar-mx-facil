
import { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

const ProfileSetupStep = () => {
  const { data, updateData, nextStep, loading } = useOnboarding();
  const [formData, setFormData] = useState({
    businessName: data.businessName,
    category: data.category,
    bio: data.bio
  });

  useEffect(() => {
    setFormData({
      businessName: data.businessName,
      category: data.category,
      bio: data.bio
    });
  }, [data]);

  const categories = [
    'haircut',
    'beard',
    'nails',
    'eyebrows',
    'massage',
    'other'
  ];

  const categoryLabels = {
    haircut: 'Corte de Cabello',
    beard: 'Barba',
    nails: 'Uñas',
    eyebrows: 'Cejas',
    massage: 'Masajes',
    other: 'Otro'
  };

  const handleNext = async () => {
    updateData(formData);
    await nextStep();
  };

  const isValid = formData.businessName.length >= 2 && formData.category;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="businessName">Nombre del Negocio *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          placeholder="Ej: Barbería José, Salón María"
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Este será el nombre que verán tus clientes
        </p>
      </div>

      <div>
        <Label htmlFor="category">Categoría del Servicio *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="bio">Descripción del Negocio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Cuéntanos sobre tu negocio, experiencia y especialidades..."
          className="mt-1"
          rows={4}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Ayuda a los clientes a conocerte mejor (opcional)
        </p>
      </div>

      <div className="flex justify-end">
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

export default ProfileSetupStep;
