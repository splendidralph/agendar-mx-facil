-- Grant admin access to iamralphjohnson@gmail.com
-- User ID: 79251ce7-3d39-4e04-b809-43f2e52d531e

INSERT INTO public.admin_users (
  user_id,
  role,
  permissions
) VALUES (
  '79251ce7-3d39-4e04-b809-43f2e52d531e',
  'admin',
  '{"full_access": true, "analytics": true, "user_management": true, "system_settings": true}'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = now();