import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadService } from './uploadService';
import { auditLogService } from './auditLogService';

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  url: string;
  createdAt: number;
  folder?: string;
}

export const mediaService = {
  subscribeToMedia(callback: (mediaItems: MediaItem[]) => void): () => void {
    const mediaRef = collection(db, 'media');
    const q = query(mediaRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[];
      callback(items);
    }, (error) => {
      console.error('Error listening to media library:', error);
    });
  },

  async getAllMedia(): Promise<MediaItem[]> {
    try {
      const mediaRef = collection(db, 'media');
      const q = query(mediaRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[];
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  async uploadMedia(file: File, folder: string = 'media'): Promise<MediaItem> {
    try {
      const validation = uploadService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const downloadUrl = await uploadService.uploadImage(file, folder);
      const mediaRef = doc(collection(db, 'media'));

      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeStr = `${sizeInMB} MB`;

      const newItem: MediaItem = {
        id: mediaRef.id,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: sizeStr,
        sizeBytes: file.size,
        url: downloadUrl,
        createdAt: Date.now(),
        folder,
      };

      await setDoc(mediaRef, newItem);
      await auditLogService.logAction('media_uploaded', `Uploaded media file: ${file.name}`, mediaRef.id, null, newItem);
      return newItem;
    } catch (error) {
      console.error('Failed to upload media:', error);
      throw error;
    }
  },

  async replaceMedia(mediaId: string, oldUrl: string, newFile: File): Promise<MediaItem> {
    try {
      const validation = uploadService.validateImageFile(fileValidationCheck(newFile));
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const newUrl = await uploadService.uploadImage(newFile, 'media');
      const mediaRef = doc(db, 'media', mediaId);

      const sizeInMB = (newFile.size / (1024 * 1024)).toFixed(2);
      const updatedItem: Partial<MediaItem> = {
        name: newFile.name,
        size: `${sizeInMB} MB`,
        sizeBytes: newFile.size,
        url: newUrl,
        createdAt: Date.now(),
      };

      await setDoc(mediaRef, updatedItem, { merge: true });

      // Clean up old storage file after successful replacement
      if (oldUrl && oldUrl !== newUrl) {
        await uploadService.deleteImage(oldUrl);
      }

      await auditLogService.logAction('media_replaced', `Replaced media file: ${newFile.name}`, mediaId, { url: oldUrl }, updatedItem);

      return { id: mediaId, ...updatedItem } as MediaItem;
    } catch (error) {
      console.error('Failed to replace media:', error);
      throw error;
    }
  },

  async deleteMedia(mediaId: string, url: string, name?: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'media', mediaId));
      if (url) {
        await uploadService.deleteImage(url);
      }
      await auditLogService.logAction('media_deleted', `Deleted media file: ${name || mediaId}`, mediaId);
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  }
};

function fileValidationCheck(f: File) {
  return f;
}
