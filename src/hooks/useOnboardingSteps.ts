
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { validateStep } from '@/utils/onboardingValidation';
import { updateProviderStep } from '@/services/onboardingService';

export const useOnboardingSteps = (
  userId: string | undefined,
  data: OnboardingData,
  updateData: (updates: Partial<OnboardingData>) => void,
  saveCurrentStep: (dataToSave?: OnboardingData, currentStep?: number) => Promise<boolean>
) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(data.step || 1);

  // Sync currentStep with data.step when data changes
  useEffect(() => {
    if (data.step && data.step !== currentStep) {
      console.log('useOnboardingSteps: Syncing step from data. Old:', currentStep, 'New:', data.step);
      setCurrentStep(data.step);
    }
  }, [data.step, currentStep]);

  const nextStep = useCallback(async (updatedData?: Partial<OnboardingData>) => {
    console.log('► nextStep start - currentStep:', currentStep, 'data before:', {
      businessName: data.businessName,
      category: data.category,
      username: data.username,
      servicesCount: data.services?.length || 0
    });
    
    // Prepare data for validation
    const dataForValidation = { ...data, ...updatedData };
    console.log('nextStep: Data for validation:', {
      step: currentStep,
      businessName: dataForValidation.businessName,
      category: dataForValidation.category,
      username: dataForValidation.username,
      servicesCount: dataForValidation.services?.length || 0
    });
    
    // Update local data state first
    if (updatedData) {
      updateData(updatedData);
    }
    
    // Validate current step with the updated data
    const isValid = validateStep(currentStep, dataForValidation);
    console.log('nextStep: Validation result for step', currentStep, ':', isValid);
    
    if (!isValid) {
      console.warn('✋ Validation failed for step', currentStep);
      return;
    }
    
    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const nextStepNumber = currentStep + 1;
      console.log('✔️ Validation passed. Advancing from step', currentStep, 'to step', nextStepNumber);
      
      try {
        // Save the current step data
        console.log('nextStep: Saving current step data...');
        const saved = await saveCurrentStep(dataForValidation, currentStep);
        
        if (!saved) {
          console.log('nextStep: Save failed, not advancing');
          return;
        }

        // Update the step in the database
        if (userId) {
          await updateProviderStep(userId, nextStepNumber);
          console.log('nextStep: Successfully updated step in database to:', nextStepNumber);
        }
        
        // Update local state
        console.log('nextStep: Updating local state to step:', nextStepNumber);
        setCurrentStep(nextStepNumber);
        updateData({ step: nextStepNumber });
        
      } catch (error) {
        console.error('❌ nextStep error:', error);
        toast.error('Error avanzando al siguiente paso');
      }
    } else {
      console.log('nextStep: Already at final step (5)');
    }
  }, [currentStep, data, updateData, saveCurrentStep, userId]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      console.log('useOnboardingSteps: Moving to previous step:', newStep);
      setCurrentStep(newStep);
      updateData({ step: newStep });
    }
  }, [currentStep, updateData]);

  const setStep = useCallback((step: number) => {
    console.log('useOnboardingSteps: Setting step to:', step);
    setCurrentStep(step);
    updateData({ step });
  }, [updateData]);

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep
  };
};
