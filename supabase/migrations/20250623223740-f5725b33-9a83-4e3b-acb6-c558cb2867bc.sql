
-- Step 4: Create or replace function and trigger
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
