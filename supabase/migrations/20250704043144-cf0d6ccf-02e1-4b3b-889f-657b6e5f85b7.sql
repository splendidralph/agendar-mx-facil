-- Clean up Ralph's provider data and convert to admin-only user

-- Step 1: Delete associated services
DELETE FROM services 
WHERE provider_id = '35122897-7423-401d-8019-3301ffaec59f';

-- Step 2: Delete notification preferences
DELETE FROM notification_preferences 
WHERE provider_id = '35122897-7423-401d-8019-3301ffaec59f';

-- Step 3: Delete the provider record
DELETE FROM providers 
WHERE id = '35122897-7423-401d-8019-3301ffaec59f';

-- Step 4: Update user role from provider to client
UPDATE users 
SET role = 'client'
WHERE id = '79251ce7-3d39-4e04-b809-43f2e52d531e';