-- Create a storage bucket for echoes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('echoes', 'echoes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the echoes bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'echoes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'echoes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to all files (needed for playing audio)
CREATE POLICY "Public can read all audio files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'echoes'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'echoes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'echoes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
