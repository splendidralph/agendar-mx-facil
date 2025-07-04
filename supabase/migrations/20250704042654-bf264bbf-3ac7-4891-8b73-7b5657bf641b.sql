-- Step 1: Create a security definer function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_id_param
  );
$$;

-- Step 2: Drop the existing RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

-- Step 3: Create a new RLS policy using the security definer function
CREATE POLICY "Admins can manage admin users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));