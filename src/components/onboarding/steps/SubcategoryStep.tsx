import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { Subcategory } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';

interface SubcategoryStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const SubcategoryStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false,
  validationErrors 
}: SubcategoryStepProps) => {
  const { getSubcategoriesByMainCategory } = useCategories();
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | undefined>(data.subcategory);

  const subcategories = data.mainCategory 
    ? getSubcategoriesByMainCategory(data.mainCategory.id)
    : [];

  const handleSubcategorySelect = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    onUpdate({ subcategory });
  };

  const handleNext = async () => {
    if (!selectedSubcategory) return;
    await onNext({ subcategory: selectedSubcategory });
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  if (!data.mainCategory) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Primero debes seleccionar una categoría principal
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Especialízate en {data.mainCategory.display_name}
        </h3>
        <p className="text-muted-foreground mb-4">
          Selecciona tu especialidad dentro de {data.mainCategory.display_name.toLowerCase()}
        </p>
        {getFieldError('subcategory') && (
          <p className="text-sm text-red-500 mb-4">{getFieldError('subcategory')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcategories.map((subcategory) => (
          <Card 
            key={subcategory.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSubcategory?.id === subcategory.id 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleSubcategorySelect(subcategory)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {subcategory.icon && (
                  <div className="text-3xl mb-2">{subcategory.icon}</div>
                )}
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {subcategory.display_name}
                </h4>
                {subcategory.description && (
                  <p className="text-sm text-muted-foreground">
                    {subcategory.description}
                  </p>
                )}
              </div>
              {selectedSubcategory?.id === subcategory.id && (
                <Badge className="bg-primary text-primary-foreground">
                  Seleccionado
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={!!selectedSubcategory}
        loading={loading}
        nextLabel="Continuar"
      />
    </div>
  );
};