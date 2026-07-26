import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export const uploadService = {
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async deleteImage(url: string): Promise<void> {
    try {
      if (!url.includes('firebaseapp.com') && !url.includes('firebasestorage.googleapis.com')) {
        return; // Don't try to delete mock images
      }
      
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
};
