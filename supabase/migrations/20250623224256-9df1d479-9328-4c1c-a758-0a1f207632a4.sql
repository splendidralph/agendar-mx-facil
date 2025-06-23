
-- STEP 1: Create enum type user_role if missing (run standalone)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('provider', 'client');
  END IF;
END
$$;
