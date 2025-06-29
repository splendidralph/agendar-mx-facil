
import { OnboardingData } from '@/types/onboarding';

// Helper function to determine the correct step based on data completeness
export const determineStepFromData = (data: OnboardingData, dbStep?: number): number => {
  console.log('determineStepFromData: Evaluating data:', {
    businessName: !!data.businessName,
    category: !!data.category,
    username: !!data.username,
    servicesCount: data.services.length,
    dbStep
  });

  // If we have a database step and it's valid, prioritize it for consistency
  if (dbStep && dbStep >= 1 && dbStep <= 5) {
    console.log('determineStepFromData: Using database step:', dbStep);
    return dbStep;
  }

  // Step 1: Requires business_name and category
  if (!data.businessName || !data.category) {
    console.log('determineStepFromData: Missing basic info, returning step 1');
    return 1;
  }
  
  // Step 2: Contact step (optional fields)
  if (data.businessName && data.category && !data.username) {
    console.log('determineStepFromData: Have basic info, no username, returning step 2');
    return 2;
  }
  
  // Step 3: Requires username
  if (!data.username) {
    console.log('determineStepFromData: Missing username, returning step 3');
    return 3;
  }
  
  // Step 4: Requires at least one valid service
  const validServices = data.services.filter(service => 
    service.name && service.name.length >= 2 && service.price > 0
  );
  if (validServices.length === 0) {
    console.log('determineStepFromData: No valid services, returning step 4');
    return 4;
  }
  
  // Step 5: All data complete, show preview
  console.log('determineStepFromData: All data complete, returning step 5');
  return 5;
};
