
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { generateUsername, checkUsernameAvailability } from '@/utils/usernameUtils';
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { useOnboardingSteps } from '@/hooks/useOnboardingSteps';

export const useOnboarding = () => {
  const { user } = useAuth();
  const {
    data,
    loading,
    dataLoaded,
    loadExistingData,
    updateData,
    saveCurrentStep,
    completeOnboarding
  } = useOnboardingData(user?.id);

  const {
    currentStep,
    nextStep,
    prevStep,
    setStep
  } = useOnboardingSteps(user?.id, data, updateData, saveCurrentStep);

  useEffect(() => {
    if (user && !dataLoaded) {
      console.log('useOnboarding: Loading existing data for user:', user.id);
      loadExistingData().then((step) => {
        if (step) {
          setStep(step);
        }
      });
    }
  }, [user, dataLoaded, loadExistingData, setStep]);

  return {
    currentStep,
    data,
    loading,
    updateData,
    nextStep,
    prevStep,
    saveCurrentStep,
    completeOnboarding,
    generateUsername,
    checkUsernameAvailability
  };
};
