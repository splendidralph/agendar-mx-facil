import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepNavigation } from '../StepNavigation';
import { OnboardingData } from '@/types/onboarding';
import { MainCategory } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface NameCategoryStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (data?: Partial<OnboardingData>) => Promise<boolean>;
  onPrevious: () => void;
  loading?: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}

export const NameCategoryStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  loading = false,
  validationErrors 
}: NameCategoryStepProps) => {
  const { user } = useAuth();
  const { mainCategories, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    businessName: data.businessName || '',
    mainCategory: data.mainCategory
  });
  
  const [isProgressing, setIsProgressing] = useState(false);

  useEffect(() => {
    setFormData({
      businessName: data.businessName || '',
      mainCategory: data.mainCategory
    });
  }, [data.businessName, data.mainCategory]);

  const handleCategorySelect = async (category: MainCategory) => {
    const newData = { 
      ...formData,
      mainCategory: category,
      subcategory: undefined // Reset subcategory when main category changes
    };
    
    setFormData(newData);
    onUpdate(newData);

    // Auto-progress after a brief delay for visual feedback
    setIsProgressing(true);
    toast.success(`${category.display_name} seleccionado`);
    
    setTimeout(async () => {
      try {
        await onNext(newData);
      } catch (error) {
        console.error('Error auto-advancing from name-category step:', error);
        toast.error('Error avanzando al siguiente paso');
      } finally {
        setIsProgressing(false);
      }
    }, 800);
  };

  const handleNameChange = (value: string) => {
    const newData = { ...formData, businessName: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleNext = async () => {
    if (!formData.businessName.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }
    if (!formData.mainCategory) {
      toast.error('Por favor selecciona una categoría');
      return;
    }
    await onNext(formData);
  };

  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const canProceed = Boolean(
    formData.businessName.trim() && 
    formData.mainCategory && 
    !isProgressing
  );

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
        <h3 className="text-xl font-bold text-foreground mb-6 font-poppins">
          Tu nombre y especialidad
        </h3>
        
        {/* Business Name */}
        <div className="mb-6">
          <Label htmlFor="businessName" className="text-base font-medium">
            ¿Cómo te llamas? *
          </Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej: María García, José López"
            className={`mt-2 ${getFieldError('businessName') ? 'border-red-500' : ''}`}
          />
          {getFieldError('businessName') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('businessName')}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Este será el nombre que verán tus clientes
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <Label className="text-base font-medium mb-4 block">
            ¿Qué tipo de servicios ofreces? *
          </Label>
          {getFieldError('mainCategory') && (
            <p className="text-sm text-red-500 mb-4">{getFieldError('mainCategory')}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCategories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                  formData.mainCategory?.id === category.id 
                    ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-lg scale-[1.02]' 
                    : 'border-border hover:border-primary/70'
                } ${isProgressing && formData.mainCategory?.id === category.id ? 'animate-pulse' : ''}`}
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
                  {formData.mainCategory?.id === category.id && (
                    <Badge className="bg-primary text-primary-foreground transition-all duration-200">
                      {isProgressing ? 'Continuando...' : 'Seleccionado'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <StepNavigation
        onPrevious={onPrevious}
        onNext={handleNext}
        canProceed={canProceed}
        loading={loading || isProgressing}
        nextLabel={isProgressing ? "Continuando..." : "Continuar"}
      />
    </div>
  );
};