
-- Reset the current user's onboarding step to 1 for a fresh start
UPDATE providers 
SET onboarding_step = 1, 
    profile_completed = false 
WHERE user_id = (
  SELECT id FROM users 
  WHERE email = 'iamralphjohnson@gmail.com'
);
