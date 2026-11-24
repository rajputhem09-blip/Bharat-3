import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadProgressCallback {
  (progress: number, state: 'running' | 'paused' | 'success' | 'error'): void;
}

export interface UploadResult {
  url: string;
  name: string;
  size: string;
  type: 'image' | 'video' | 'audio' | 'document';
  duration?: number;
}

// Format bytes into readable string (e.g. 2.4 MB)
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Upload chat media attachment to Firebase Storage with real-time progress
 */
export const uploadChatMedia = (
  chatId: string,
  file: File | Blob,
  fileName: string,
  type: 'image' | 'video' | 'audio' | 'document',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `chats/${chatId}/media/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) {
            onProgress(progress, snapshot.state as 'running' | 'paused');
          }
        },
        (error) => {
          console.error('Upload failed:', error);
          if (onProgress) {
            onProgress(0, 'error');
          }
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress(100, 'success');
            }
            resolve({
              url: downloadUrl,
              name: fileName,
              size: formatBytes(file.size || 0),
              type,
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Upload story photo/video media to Firebase Storage with real-time progress
 */
export const uploadStoryMedia = (
  userId: string,
  storyId: string,
  file: File | Blob,
  fileName: string,
  type: 'image' | 'video',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `stories/${userId}/${storyId}/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) {
            onProgress(progress, snapshot.state as 'running' | 'paused');
          }
        },
        (error) => {
          console.error('Story media upload failed:', error);
          if (onProgress) {
            onProgress(0, 'error');
          }
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress(100, 'success');
            }
            resolve({
              url: downloadUrl,
              name: fileName,
              size: formatBytes(file.size || 0),
              type,
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const uploadChannelMedia = (
  channelId: string,
  file: File | Blob,
  fileName: string,
  type: 'image' | 'video' | 'audio' | 'document',
  onProgress?: UploadProgressCallback
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `channels/${channelId}/posts/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) {
            onProgress(progress, snapshot.state as 'running' | 'paused');
          }
        },
        (error) => {
          console.error('Channel upload failed:', error);
          if (onProgress) {
            onProgress(0, 'error');
          }
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) {
              onProgress(100, 'success');
            }
            resolve({
              url: downloadUrl,
              name: fileName,
              size: formatBytes(file.size || 0),
              type,
            });
          } catch (err) {
            reject(err);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
