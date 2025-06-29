
import { useState, useCallback, useEffect } from 'react';
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

  // Sync currentStep with data.step when data changes
  useEffect(() => {
    if (data.step && data.step !== currentStep) {
      console.log('useOnboardingSteps: Syncing step from data:', data.step);
      setCurrentStep(data.step);
    }
  }, [data.step]);

  const nextStep = useCallback(async (updatedData?: Partial<OnboardingData>) => {
    console.log('useOnboardingSteps: nextStep called for step:', currentStep);
    console.log('useOnboardingSteps: updatedData:', updatedData);
    console.log('useOnboardingSteps: current global data:', {
      businessName: data.businessName,
      category: data.category,
      username: data.username,
      servicesCount: data.services?.length || 0
    });
    
    // Prepare data for validation and saving
    let dataForValidation = { ...data };
    
    // If we have updated data, merge it immediately
    if (updatedData) {
      dataForValidation = { ...dataForValidation, ...updatedData };
      console.log('useOnboardingSteps: Merged data for validation:', {
        businessName: dataForValidation.businessName,
        category: dataForValidation.category,
        username: dataForValidation.username,
        servicesCount: dataForValidation.services?.length || 0
      });
      
      // Update local data state immediately to ensure UI sync
      updateData(updatedData);
    }
    
    // Validate step requirements with the merged data
    const isStepValid = validateStepRequirements(currentStep, dataForValidation);
    console.log('useOnboardingSteps: Step validation result:', isStepValid);
    
    if (!isStepValid) {
      console.log('useOnboardingSteps: Validation failed, not advancing');
      return;
    }
    
    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const newStep = currentStep + 1;
      console.log('useOnboardingSteps: Advancing to step:', newStep);
      
      try {
        // Save the current step with the validated data
        console.log('useOnboardingSteps: Saving current step data...');
        const saved = await saveCurrentStep(dataForValidation, currentStep);
        
        if (!saved) {
          console.log('useOnboardingSteps: Save failed, not advancing');
          return;
        }

        // Update the step in the database
        if (userId) {
          await updateProviderStep(userId, newStep);
          console.log('useOnboardingSteps: Successfully updated step in database');
        }
        
        // Update local state
        setCurrentStep(newStep);
        updateData({ step: newStep });
        console.log('useOnboardingSteps: Successfully advanced to step:', newStep);
        
      } catch (error) {
        console.error('useOnboardingSteps: Error during step advancement:', error);
        toast.error('Error avanzando al siguiente paso');
      }
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

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep
  };
};
