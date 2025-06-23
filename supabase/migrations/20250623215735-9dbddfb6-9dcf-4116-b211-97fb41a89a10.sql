
-- Check if the trigger exists
SELECT tgname, tgrelid::regclass AS table_name, proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Check if the user_role enum type exists
SELECT typname, enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname = 'user_role'
ORDER BY enumsortorder;

-- Check if the handle_new_user function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Check if users table exists with correct structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
