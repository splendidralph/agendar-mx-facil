
-- Fixed migration using proper PostgreSQL syntax for conditional type creation

-- Step 1: Create enum type conditionally (using DO block for type creation only)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('provider', 'client');
    END IF;
END $$;

-- Step 2: Create or update users table with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Ensure role column is correctly typed (in case table already existed)
ALTER TABLE public.users
  ALTER COLUMN role TYPE user_role USING role::user_role;

-- Step 4: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  incoming_role TEXT;
  full_name TEXT;
  safe_role user_role;
BEGIN
  IF NEW.raw_user_meta_data IS NULL THEN
    incoming_role := NULL;
    full_name := NULL;
  ELSE
    incoming_role := NEW.raw_user_meta_data ->> 'role';
    full_name := NEW.raw_user_meta_data ->> 'full_name';
  END IF;

  RAISE LOG 'handle_new_user called with user_id: %, email: %, role: %, full_name: %',
    NEW.id, NEW.email, incoming_role, full_name;

  IF incoming_role IS NULL OR incoming_role = '' THEN
    safe_role := 'client';
    RAISE LOG 'No role provided, defaulting to client';
  ELSE
    BEGIN
      safe_role := incoming_role::user_role;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Invalid role value: %, defaulting to client', incoming_role;
      safe_role := 'client';
    END;
  END IF;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(full_name, NEW.email),
    safe_role
  );

  RAISE LOG 'User profile created successfully for user_id: %', NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Enable RLS and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
