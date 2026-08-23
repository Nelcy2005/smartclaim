import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  uploadedAt: string;
  storageType?: 'firebase-storage' | 'inline-data-url';
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const UPLOAD_TIMEOUT_MS = 6000; // 6 seconds safety limit before seamless fallback

/**
 * Validates file format and file size
 */
export function validateEvidenceFile(file: File | null): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      errorMessage: 'Please select an image file to upload.',
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith('image/');

  if (!hasValidExtension && !hasValidMime) {
    return {
      isValid: false,
      errorMessage: 'Please upload a JPG, JPEG, PNG or WEBP image under 10 MB.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorMessage: 'Please upload a JPG, JPEG, PNG or WEBP image under 10 MB.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: 'The selected file is empty. Please upload a valid image.',
    };
  }

  return { isValid: true };
}

/**
 * Validates that an image file can actually be decoded/read by the browser
 * with a strict 2-second timeout guard to prevent hanging.
 */
export async function validateImageReadable(file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    let resolved = false;
    let objectUrl = '';

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        // If timeout reached but file size is valid, proceed
        resolve({ isValid: true });
      }
    }, 2000);

    try {
      objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          URL.revokeObjectURL(objectUrl);
          if (img.width === 0 || img.height === 0) {
            resolve({
              isValid: false,
              errorMessage: 'The image could not be read. Please upload another image.',
            });
          } else {
            resolve({ isValid: true });
          }
        }
      };

      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          URL.revokeObjectURL(objectUrl);
          resolve({
            isValid: false,
            errorMessage: 'The image could not be read. Please upload another image.',
          });
        }
      };

      img.src = objectUrl;
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        resolve({
          isValid: false,
          errorMessage: 'The image could not be read. Please upload another image.',
        });
      }
    }
  });
}

/**
 * Creates an optimized compressed Data URL representation of the image.
 * Resizes max dimension to 800px and compresses as JPEG (~60-100KB) to ensure safe storage in Firestore.
 */
export async function createOptimizedImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return resolve('');

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(rawDataUrl);

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed || rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a claim evidence photo to Firebase Storage with an automatic high-performance fallback
 * Structured path: claims/{userId}/{claimId}/evidence/{fileName}
 * Uses direct uploadBytes + getDownloadURL with automatic fallback to optimized inline Data URL.
 */
export async function uploadClaimEvidenceImage(params: {
  userId: string;
  claimId: string;
  file: File;
}): Promise<StorageUploadResult> {
  const { userId, claimId, file } = params;

  if (!userId) {
    throw new Error('You need to sign in before uploading evidence.');
  }

  if (!claimId) {
    throw new Error('Claim identifier is missing. Please try again.');
  }

  // Pre-validate file
  const validation = validateEvidenceFile(file);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || 'Invalid image file.');
  }

  // Sanitize filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `claims/${userId}/${claimId}/evidence/${cleanName}`;
  const uploadedAt = new Date().toISOString();

  const contentType = file.type && file.type.startsWith('image/')
    ? file.type
    : (file.name.toLowerCase().endsWith('.png') ? 'image/png' : (file.name.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg'));

  // Attempt Firebase Cloud Storage upload first with a fast timeout
  try {
    const storageReference = ref(storage, storagePath);

    let timerId: ReturnType<typeof setTimeout> | null = null;
    const uploadTask = (async (): Promise<StorageUploadResult> => {
      const uploadSnapshot = await uploadBytes(storageReference, file, {
        contentType,
        customMetadata: {
          uploadedByUserId: userId,
          claimId: claimId,
          originalFileName: file.name,
        },
      });

      const downloadUrl = await getDownloadURL(uploadSnapshot.ref);
      if (timerId) clearTimeout(timerId);

      return {
        downloadUrl,
        storagePath,
        fileName: file.name,
        uploadedAt,
        storageType: 'firebase-storage',
      };
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(() => {
        reject(new Error('Firebase Storage timeout'));
      }, UPLOAD_TIMEOUT_MS);
    });

    const result = await Promise.race([uploadTask, timeoutPromise]);
    return result;
  } catch (storageError) {
    // If Firebase Storage bucket is offline, unconfigured, or throws retry-limit-exceeded / CORS,
    // seamlessly fall back to an optimized Data URL so the user is never blocked.
    console.warn('Firebase Storage upload unavailable, using optimized local storage fallback:', storageError);

    const fallbackDataUrl = await createOptimizedImageDataUrl(file);
    if (!fallbackDataUrl) {
      throw new Error('Failed to process image. Please choose another image file.');
    }

    return {
      downloadUrl: fallbackDataUrl,
      storagePath,
      fileName: file.name,
      uploadedAt,
      storageType: 'inline-data-url',
    };
  }
}

/**
 * Deletes a previously uploaded evidence file from Firebase Storage
 */
export async function deleteClaimEvidenceImage(storagePath?: string): Promise<void> {
  if (!storagePath) return;
  try {
    const storageReference = ref(storage, storagePath);
    await deleteObject(storageReference);
  } catch (error: any) {
    // If object does not exist or deletion fails, log warning without throwing fatal error
    console.warn('Could not delete storage object at path:', storagePath, error?.message);
  }
}
