
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OnboardingData } from '@/types/onboarding';
import { validateStepRequirements } from '@/utils/onboardingValidation';
import { updateProviderStep } from '@/services/onboardingService';

export const useOnboardingSteps = (
  userId: string | undefined,
  data: OnboardingData,
  updateData: (updates: Partial<OnboardingData>) => void,
  saveCurrentStep: (dataToSave?: OnboardingData, currentStep?: number) => Promise<boolean>
) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(data.step || 1);

  const nextStep = useCallback(async (updatedData?: Partial<OnboardingData>) => {
    console.log('useOnboardingSteps: nextStep called, current step:', currentStep);
    console.log('useOnboardingSteps: updatedData provided:', updatedData);
    
    // If we have updated data, merge it with current data for validation and saving
    let dataForValidation = data;
    if (updatedData) {
      dataForValidation = { ...data, ...updatedData };
      console.log('useOnboardingSteps: Using updated data for validation:', dataForValidation);
      // Update local data state immediately
      updateData(updatedData);
    }
    
    // Validate step requirements before advancing
    const isStepValid = validateStepRequirements(currentStep, dataForValidation);
    console.log('useOnboardingSteps: Step validation result:', isStepValid);
    if (!isStepValid) {
      console.log('useOnboardingSteps: Step validation failed, not advancing');
      return;
    }
    
    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      console.log('useOnboardingSteps: Advancing to step:', newStep);
      
      // First save the current step with the provided data
      console.log('useOnboardingSteps: Attempting to save current step...');
      const saved = await saveCurrentStep(dataForValidation, currentStep);
      console.log('useOnboardingSteps: Save result:', saved);
      if (!saved) {
        console.log('useOnboardingSteps: Failed to save, not advancing step');
        return;
      }

      // Update the step in the database immediately
      if (userId) {
        try {
          await updateProviderStep(userId, newStep);
          console.log('useOnboardingSteps: Successfully updated step in database');
        } catch (error) {
          console.error('useOnboardingSteps: Error updating step:', error);
          toast.error('Error avanzando al siguiente paso');
          return;
        }
      }
      
      setCurrentStep(newStep);
      updateData({ step: newStep });
      console.log('useOnboardingSteps: Step state updated to:', newStep);
    } else {
      console.log('useOnboardingSteps: Already at final step');
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

  // Update currentStep when data.step changes
  useState(() => {
    if (data.step && data.step !== currentStep) {
      setCurrentStep(data.step);
    }
  });

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep
  };
};
