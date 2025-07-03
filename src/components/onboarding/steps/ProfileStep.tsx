import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StepNavigation } from '../StepNavigation';
import { categories, categoryLabels } from '@/utils/serviceCategories';
import { OnboardingData } from '@/types/onboarding';

interface ProfileStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

const categoryDescriptions = {
  corte_barberia: 'Cortes de cabello, barba, bigote y servicios de barbería tradicional',
  unas: 'Manicure, pedicure, esmaltado, decoración y cuidado de uñas',
  maquillaje_cejas: 'Maquillaje profesional, diseño de cejas, micropigmentación',
  cuidado_facial: 'Tratamientos faciales, limpiezas, hidratación y cuidado de la piel',
  masajes_relajacion: 'Masajes terapéuticos, relajantes y tratamientos corporales',
  color_alisado: 'Coloración, mechas, alisados, tratamientos capilares'
} as const;

export const ProfileStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  loading = false,
  validationErrors 
}: ProfileStepProps) => {
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    category: data.category || '',
    bio: data.bio || ''
  });

  useEffect(() => {
    setFormData({
      businessName: data.businessName || '',
      category: data.category || '',
      bio: data.bio || ''
    });
  }, [data.businessName, data.category, data.bio]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleNext = async () => {
    await onNext(formData);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const isValid = Boolean(formData.businessName.trim() && formData.category);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="businessName" className="text-base font-medium">
          Nombre del Negocio *
        </Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          placeholder="Ej: Barbería José, Salón María"
          className={`mt-2 ${getFieldError('businessName') ? 'border-red-500' : ''}`}
        />
        {getFieldError('businessName') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('businessName')}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          Este será el nombre que verán tus clientes
        </p>
      </div>

      <div>
        <Label htmlFor="category" className="text-base font-medium">
          Categoría del Servicio *
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange('category', value)}
        >
          <SelectTrigger className={`mt-2 ${getFieldError('category') ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                <div className="flex flex-col py-1">
                  <span className="font-medium">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError('category') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('category')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio" className="text-base font-medium">
          Descripción del Negocio
        </Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Cuéntanos sobre tu negocio, experiencia y especialidades..."
          className="mt-2"
          rows={4}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Ayuda a los clientes a conocerte mejor (opcional)
        </p>
      </div>

      <StepNavigation
        onNext={handleNext}
        canGoBack={false}
        canProceed={isValid}
        loading={loading}
      />
    </div>
  );
};