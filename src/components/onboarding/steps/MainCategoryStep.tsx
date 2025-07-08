import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { MainCategory } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

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
  const [isProgressing, setIsProgressing] = useState(false);

  const handleCategorySelect = async (category: MainCategory) => {
    setSelectedCategory(category);
    onUpdate({ 
      mainCategory: category,
      subcategory: undefined // Reset subcategory when main category changes
    });

    // Auto-progress after a brief delay for visual feedback
    setIsProgressing(true);
    toast.success(`${category.display_name} seleccionado`);
    
    setTimeout(async () => {
      try {
        await onNext({ mainCategory: category });
      } catch (error) {
        console.error('Error auto-advancing from main category step:', error);
        toast.error('Error avanzando al siguiente paso');
      } finally {
        setIsProgressing(false);
      }
    }, 800);
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
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
              selectedCategory?.id === category.id 
                ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-lg scale-[1.02]' 
                : 'border-border hover:border-primary/70'
            } ${isProgressing && selectedCategory?.id === category.id ? 'animate-pulse' : ''}`}
            onClick={() => !isProgressing && handleCategorySelect(category)}
          >
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {category.icon && (
                  <div className="text-4xl mb-2 transition-transform duration-200">
                    {category.icon}
                  </div>
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
                <Badge className="bg-primary text-primary-foreground transition-all duration-200">
                  {isProgressing ? 'Continuando...' : 'Seleccionado'}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={!!selectedCategory && !isProgressing}
        loading={loading || isProgressing}
        nextLabel={isProgressing ? "Continuando..." : "Continuar"}
      />
    </div>
  );
};