-- Attachments Storage Bucket RLS Policies
-- These policies control access to files in the 'attachments' storage bucket

-- First, enable Row Level Security on the storage.objects table for the attachments bucket
BEGIN;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own files
-- This policy allows users to upload files if the path starts with their user_id
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policy to allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policy to allow users to read their own files
CREATE POLICY "Users can read their own files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'attachments' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Optionally: Create policy to allow public access to specific files 
-- (useful if you need some files to be publicly accessible)
/*
CREATE POLICY "Public Access for specific files" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'attachments' AND 
        (storage.foldername(name))[2] = 'public'
    );
*/

COMMIT;