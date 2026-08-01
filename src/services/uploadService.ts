import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadService = {
  validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }
    const isAllowed = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) || 
                      /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isAllowed) {
      return { valid: false, error: 'Unsupported file format. Please upload PNG, JPG, JPEG, or WEBP.' };
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }
    return { valid: true };
  },

  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file format');
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Image upload failed. Storage unavailable or network issue.');
    }
  },

  async deleteImage(url: string): Promise<void> {
    if (!url || typeof url !== 'string') return;
    try {
      if (!url.includes('firebaseapp.com') && !url.includes('firebasestorage.googleapis.com')) {
        return; // Skip mock or unsplash URLs
      }
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.warn('Storage file deletion skipped or failed:', error);
      // Non-blocking catch to prevent cascading breaks if file already deleted
    }
  },

  async replaceImage(oldUrl: string | undefined, newFile: File, folder: string = 'uploads'): Promise<string> {
    const newUrl = await this.uploadImage(newFile, folder);
    if (oldUrl && oldUrl !== newUrl) {
      await this.deleteImage(oldUrl);
    }
    return newUrl;
  }
};
