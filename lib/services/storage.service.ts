/**
 * Storage Service
 * Handles image uploads to Supabase Storage
 */

import { createSupabaseClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/supabase-utils';

/**
 * Upload image to Supabase Storage
 * @param file - File to upload
 * @param userId - Optional user ID (will be fetched if not provided)
 * @returns Public URL of uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  userId?: string
): Promise<string> {
  const supabase = createSupabaseClient();
  
  // Get user ID if not provided
  const finalUserId = userId || (await getCurrentUserId()) || 'anonymous';
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${finalUserId}/${timestamp}-${randomId}.${fileExtension}`;

  // Upload to 'image' bucket (as per your Supabase setup)
  const { data, error } = await supabase.storage
    .from('image')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('image')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Storage service object (for compatibility with error message)
 */
export const storageService = {
  uploadImage: uploadImageToSupabase,
};

export default storageService;

