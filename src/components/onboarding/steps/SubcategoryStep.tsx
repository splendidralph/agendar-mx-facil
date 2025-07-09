import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { Subcategory } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

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
  const [isProgressing, setIsProgressing] = useState(false);

  const subcategories = data.mainCategory 
    ? getSubcategoriesByMainCategory(data.mainCategory.id)
    : [];

  // Auto-advance if no subcategories available
  useEffect(() => {
    if (data.mainCategory && subcategories.length === 0 && !isProgressing) {
      console.log('[SUBCATEGORY] No subcategories available, auto-advancing...');
      setIsProgressing(true);
      toast.info('No hay subcategorías disponibles, continuando...');
      
      setTimeout(async () => {
        try {
          await onNext({});
        } catch (error) {
          console.error('Error auto-advancing from subcategory step:', error);
          setIsProgressing(false);
        }
      }, 1000);
    }
  }, [data.mainCategory, subcategories.length, onNext, isProgressing]);

  const handleSubcategorySelect = async (subcategory: Subcategory) => {
    if (isProgressing) return;
    
    setSelectedSubcategory(subcategory);
    onUpdate({ subcategory });
    setIsProgressing(true);
    
    toast.success(`${subcategory.display_name} seleccionado`);
    
    // Auto-advance to next step with delay for UX
    setTimeout(async () => {
      try {
        await onNext({ subcategory });
      } catch (error) {
        console.error('Error auto-advancing from subcategory step:', error);
        setIsProgressing(false);
      }
    }, 800);
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

  if (isProgressing && subcategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Continuando al siguiente paso...
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

      {subcategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategories.map((subcategory) => (
            <Card 
              key={subcategory.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedSubcategory?.id === subcategory.id 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              } ${isProgressing ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !isProgressing && handleSubcategorySelect(subcategory)}
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
                    {isProgressing ? 'Continuando...' : 'Seleccionado'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No hay subcategorías específicas para {data.mainCategory.display_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Puedes continuar directamente a configurar tus servicios
          </p>
        </div>
      )}

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={subcategories.length === 0 || !!selectedSubcategory}
        loading={loading || isProgressing}
        nextLabel={isProgressing ? "Continuando..." : subcategories.length === 0 ? "Continuar sin subcategoría" : "Continuar"}
      />
    </div>
  );
};