import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_ASSETS_BUCKET || 'image';

export interface UploadImageOptions {
    userId?: string;
    sessionId?: string;
    folder?: string;
}

/**
 * Upload image to Supabase Storage
 * @param file - Image file to upload
 * @param options - Upload options (userId, sessionId, folder)
 * @returns Public URL of uploaded image
 */
export async function uploadImageToSupabase(
    file: File,
    options: UploadImageOptions = {}
): Promise<string> {
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('Image size must be less than 10MB');
        }

        // Generate unique file name
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${options.folder || 'chat'}/${options.userId || 'anonymous'}/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
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
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(error.message || 'Failed to upload image');
        throw error;
    }
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Public URL of the image
 */
export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME);
        
        if (bucketIndex === -1) {
            throw new Error('Invalid image URL');
        }

        const filePath = pathParts.slice(bucketIndex + 1).join('/');

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete image: ${error.message}`);
        }
    } catch (error: any) {
        console.error('Image delete error:', error);
        // Don't throw - deletion failure is not critical
    }
}

export const storageService = {
    uploadImage: uploadImageToSupabase,
    deleteImage: deleteImageFromSupabase,
};

export default storageService;

