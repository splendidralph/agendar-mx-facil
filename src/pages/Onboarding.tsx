
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { UsernameStep } from '@/components/onboarding/steps/UsernameStep';
import { NameCategoryStep } from '@/components/onboarding/steps/NameCategoryStep';
import { SubcategoryStep } from '@/components/onboarding/steps/SubcategoryStep';
import { ServicesStep } from '@/components/onboarding/steps/ServicesStep';
import { ContactLocationStep } from '@/components/onboarding/steps/ContactLocationStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    currentStep, 
    data, 
    loading, 
    validationErrors, 
    updateData, 
    nextStep, 
    prevStep, 
    completeOnboarding 
  } = useOnboardingFlow();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const steps = [
    'Username',
    'Tu Nombre & Categoría',
    'Especialidad',
    'Servicios', 
    'Contacto & Ubicación'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UsernameStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            loading={loading}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <NameCategoryStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            onPrevious={prevStep}
            loading={loading}
            validationErrors={validationErrors}
          />
        );
      case 3:
        return (
          <SubcategoryStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            onPrevious={prevStep}
            loading={loading}
            validationErrors={validationErrors}
          />
        );
      case 4:
        return (
          <ServicesStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            onPrevious={prevStep}
            loading={loading}
            validationErrors={validationErrors}
          />
        );
      case 5:
        return (
          <ContactLocationStep 
            data={data} 
            onUpdate={updateData} 
            onNext={completeOnboarding}
            onPrevious={prevStep}
            loading={loading}
          />
        );
      default:
        return (
          <UsernameStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            loading={loading}
            validationErrors={validationErrors}
          />
        );
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={steps.length}
      stepTitle={steps[currentStep - 1]}
      loading={loading}
      canGoBack={currentStep > 1}
      onGoBack={prevStep}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

export default Onboarding;
