
import { OnboardingData } from '@/types/onboarding';

// Helper function to determine the correct step based on data completeness
export const determineStepFromData = (data: OnboardingData, dbStep?: number): number => {
  console.log('determineStepFromData: Evaluating data:', {
    businessName: !!data.businessName,
    category: !!data.category,
    username: !!data.username,
    servicesCount: data.services?.length || 0,
    dbStep
  });

  // Step 1: Requires business_name and category
  if (!data.businessName || !data.category) {
    console.log('determineStepFromData: Missing basic info, returning step 1');
    return 1;
  }
  
  // Step 2: Contact step - if we have basic info but no username yet
  if (data.businessName && data.category && !data.username) {
    console.log('determineStepFromData: Have basic info, no username, should be step 2 or 3');
    // Check if we should be on step 3 based on database step
    if (dbStep && dbStep >= 3) {
      return 3; // Username step
    }
    return 2; // Contact step
  }
  
  // Step 3: Requires username
  if (!data.username || data.username.length < 3) {
    console.log('determineStepFromData: Missing or invalid username, returning step 3');
    return 3;
  }
  
  // Step 4: Requires at least one valid service
  const validServices = (data.services || []).filter(service => 
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
