-- Fix RLS policies to properly check provider ownership for profile pictures

-- Drop current policies
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Create new policies that check provider ownership correctly
CREATE POLICY "Users can upload their provider profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND EXISTS (
    SELECT 1 FROM providers 
    WHERE providers.id::text = (storage.foldername(name))[1] 
    AND providers.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their provider profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' 
  AND EXISTS (
    SELECT 1 FROM providers 
    WHERE providers.id::text = (storage.foldername(name))[1] 
    AND providers.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their provider profile pictures" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' 
  AND EXISTS (
    SELECT 1 FROM providers 
    WHERE providers.id::text = (storage.foldername(name))[1] 
    AND providers.user_id = auth.uid()
  )
);