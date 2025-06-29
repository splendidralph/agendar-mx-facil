
import { useEffect, useMemo } from 'react';
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

  // Load data only once when user is available and data hasn't been loaded
  useEffect(() => {
    if (user?.id && !dataLoaded && !loading) {
      console.log('useOnboarding: Loading existing data for user:', user.id);
      loadExistingData();
    }
  }, [user?.id, dataLoaded, loading, loadExistingData]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
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
  }), [
    currentStep,
    data,
    loading,
    updateData,
    nextStep,
    prevStep,
    saveCurrentStep,
    completeOnboarding
  ]);
};
