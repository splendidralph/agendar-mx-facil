
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  incoming_role TEXT;
  incoming_full_name TEXT;
  safe_role user_role;
BEGIN
  -- Log the incoming data for debugging
  RAISE LOG 'handle_new_user called with user_id: %, email: %, metadata: %', 
    NEW.id, NEW.email, NEW.raw_user_meta_data;

  -- Safely handle null raw_user_meta_data
  IF NEW.raw_user_meta_data IS NULL THEN
    incoming_role := NULL;
    incoming_full_name := NULL;
    RAISE LOG 'No metadata provided, using defaults';
  ELSE
    incoming_role := NEW.raw_user_meta_data ->> 'role';
    incoming_full_name := NEW.raw_user_meta_data ->> 'full_name';
    RAISE LOG 'Extracted role: %, full_name: %', incoming_role, incoming_full_name;
  END IF;

  -- Set safe role with fallback to client
  IF incoming_role IS NULL OR incoming_role = '' THEN
    safe_role := 'client';
    RAISE LOG 'No role provided, defaulting to client';
  ELSE
    safe_role := incoming_role::user_role;
    RAISE LOG 'Role set to: %', safe_role;
  END IF;

  -- Insert the user profile
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(incoming_full_name, NEW.email),
    safe_role
  );
  
  RAISE LOG 'User profile created successfully for user_id: %', NEW.id;
  
  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
