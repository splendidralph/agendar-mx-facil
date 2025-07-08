import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { MainCategory } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';

interface MainCategoryStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const MainCategoryStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false,
  validationErrors 
}: MainCategoryStepProps) => {
  const { mainCategories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | undefined>(data.mainCategory);

  const handleCategorySelect = (category: MainCategory) => {
    setSelectedCategory(category);
    onUpdate({ 
      mainCategory: category,
      subcategory: undefined // Reset subcategory when main category changes
    });
  };

  const handleNext = async () => {
    if (!selectedCategory) return;
    await onNext({ mainCategory: selectedCategory });
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          ¿Qué tipo de servicios ofreces?
        </h3>
        <p className="text-muted-foreground mb-4">
          Selecciona la categoría principal de tus servicios
        </p>
        {getFieldError('mainCategory') && (
          <p className="text-sm text-red-500 mb-4">{getFieldError('mainCategory')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mainCategories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCategory?.id === category.id 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {category.icon && (
                  <div className="text-4xl mb-2">{category.icon}</div>
                )}
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {category.display_name}
                </h4>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
              {selectedCategory?.id === category.id && (
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
        canProceed={!!selectedCategory}
        loading={loading}
        nextLabel="Continuar"
      />
    </div>
  );
};