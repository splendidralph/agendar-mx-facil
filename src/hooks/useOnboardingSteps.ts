
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
    console.log('🚀 nextStep START - currentStep:', currentStep, 'userId:', userId);
    
    if (!userId) {
      console.error('❌ nextStep: No userId provided');
      toast.error('Error: Usuario no identificado');
      return;
    }
    
    // Prepare data for validation
    const dataForValidation = { ...data, ...updatedData };
    console.log('🔍 nextStep: Data for validation:', {
      step: currentStep,
      businessName: dataForValidation.businessName,
      category: dataForValidation.category,
      username: dataForValidation.username,
      servicesCount: dataForValidation.services?.length || 0
    });
    
    // Update local data state first
    if (updatedData) {
      console.log('📝 nextStep: Updating local data with:', updatedData);
      updateData(updatedData);
    }
    
    // Validate current step with the updated data
    const isValid = validateStep(currentStep, dataForValidation);
    console.log('✅ nextStep: Validation result for step', currentStep, ':', isValid);
    
    if (!isValid) {
      console.warn('❌ Validation failed for step', currentStep);
      return;
    }
    
    // Only advance if we're not at the final step
    if (currentStep < 5) {
      const nextStepNumber = currentStep + 1;
      console.log('⬆️ nextStep: Advancing from step', currentStep, 'to step', nextStepNumber);
      
      try {
        // Save the current step data
        console.log('💾 nextStep: Saving current step data...');
        const saved = await saveCurrentStep(dataForValidation, currentStep);
        
        if (!saved) {
          console.error('❌ nextStep: Save failed, not advancing');
          return;
        }

        // Update the step in the database
        console.log('📊 nextStep: Updating step in database to:', nextStepNumber);
        await updateProviderStep(userId, nextStepNumber);
        console.log('✅ nextStep: Successfully updated step in database');
        
        // Update local state
        console.log('🔄 nextStep: Updating local state to step:', nextStepNumber);
        setCurrentStep(nextStepNumber);
        updateData({ step: nextStepNumber });
        
        console.log('🎉 nextStep SUCCESS: Moved to step', nextStepNumber);
        
      } catch (error) {
        console.error('❌ nextStep error:', error);
        toast.error('Error avanzando al siguiente paso');
      }
    } else {
      console.log('🏁 nextStep: Already at final step (5)');
    }
  }, [currentStep, data, updateData, saveCurrentStep, userId]);

  const prevStep = useCallback(async () => {
    console.log('⬅️ prevStep START - currentStep:', currentStep, 'userId:', userId);
    
    if (!userId) {
      console.error('❌ prevStep: No userId provided');
      toast.error('Error: Usuario no identificado');
      return;
    }
    
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      console.log('⬅️ prevStep: Moving from step', currentStep, 'to step', prevStepNumber);
      
      try {
        // Update the step in the database FIRST
        console.log('📊 prevStep: Updating step in database to:', prevStepNumber);
        await updateProviderStep(userId, prevStepNumber);
        console.log('✅ prevStep: Successfully updated step in database');
        
        // Update local state
        console.log('🔄 prevStep: Updating local state to step:', prevStepNumber);
        setCurrentStep(prevStepNumber);
        updateData({ step: prevStepNumber });
        
        console.log('🎉 prevStep SUCCESS: Moved to step', prevStepNumber);
        
      } catch (error) {
        console.error('❌ prevStep error:', error);
        toast.error('Error retrocediendo al paso anterior');
      }
    } else {
      console.log('⬅️ prevStep: Already at first step, cannot go back');
    }
  }, [currentStep, updateData, userId]);

  const setStep = useCallback(async (step: number) => {
    console.log('🎯 setStep START - setting step to:', step, 'userId:', userId);
    
    if (!userId) {
      console.error('❌ setStep: No userId provided');
      return;
    }
    
    try {
      // Update the step in the database
      console.log('📊 setStep: Updating step in database to:', step);
      await updateProviderStep(userId, step);
      console.log('✅ setStep: Successfully updated step in database');
      
      // Update local state
      console.log('🔄 setStep: Updating local state to step:', step);
      setCurrentStep(step);
      updateData({ step });
      
      console.log('🎉 setStep SUCCESS: Set to step', step);
      
    } catch (error) {
      console.error('❌ setStep error:', error);
      toast.error('Error cambiando de paso');
    }
  }, [updateData, userId]);

  return {
    currentStep,
    nextStep,
    prevStep,
    setStep
  };
};
