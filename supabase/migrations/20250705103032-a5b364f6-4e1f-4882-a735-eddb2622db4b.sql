-- Clean up duplicate/conflicting storage policies for profile pictures

-- Drop old policies that have file extension restrictions
DROP POLICY IF EXISTS "Providers can upload their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Providers can update their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Providers can delete their own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can view profile pictures" ON storage.objects;

-- Keep only our new, cleaner policies (they should already exist from the previous migration)
-- But let's ensure they exist with proper names

-- Ensure our current policies exist
DO $$
BEGIN
    -- Check if our policies exist, if not create them
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own profile pictures'
    ) THEN
        CREATE POLICY "Users can upload their own profile pictures" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (
          bucket_id = 'profile-pictures' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Anyone can view profile pictures'
    ) THEN
        CREATE POLICY "Anyone can view profile pictures" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'profile-pictures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own profile pictures'
    ) THEN
        CREATE POLICY "Users can update their own profile pictures" 
        ON storage.objects 
        FOR UPDATE 
        USING (
          bucket_id = 'profile-pictures' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own profile pictures'
    ) THEN
        CREATE POLICY "Users can delete their own profile pictures" 
        ON storage.objects 
        FOR DELETE 
        USING (
          bucket_id = 'profile-pictures' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END
$$;