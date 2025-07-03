
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ProfileStep } from '@/components/onboarding/steps/ProfileStep';
import { ContactStep } from '@/components/onboarding/steps/ContactStep';
import { UsernameStep } from '@/components/onboarding/steps/UsernameStep';
import { ServicesStep } from '@/components/onboarding/steps/ServicesStep';
import { PreviewStep } from '@/components/onboarding/steps/PreviewStep';

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
    'Perfil',
    'Contacto',
    'Username',
    'Servicios',
    'Vista Previa'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProfileStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            loading={loading}
            validationErrors={validationErrors}
          />
        );
      case 2:
        return (
          <ContactStep 
            data={data} 
            onUpdate={updateData} 
            onNext={nextStep} 
            onPrevious={prevStep}
            loading={loading}
          />
        );
      case 3:
        return (
          <UsernameStep 
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
          <PreviewStep 
            data={data} 
            onPrevious={prevStep}
            onComplete={completeOnboarding}
            loading={loading}
          />
        );
      default:
        return (
          <ProfileStep 
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
