-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create policies for profile picture uploads
CREATE POLICY "Users can view profile pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Providers can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE POLICY "Providers can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);