// services/cloudinaryUpload.ts
import Cookies from 'js-cookie';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  duration?: number;
  bytes: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  eager?: string;
  transformation?: string;
  eager_async?: boolean;
  resource_type: string;
}

class CloudinaryUploadService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Get signed upload parameters from backend
   * Backend generates signature using CLOUDINARY_API_SECRET
   */
  private async getUploadSignature(uploadType: 'audio' | 'image'): Promise<SignatureResponse> {
    const token = Cookies.get('accessToken');
    
    const response = await fetch(`${this.apiUrl}/upload/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ uploadType })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get upload signature');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Upload audio file directly to Cloudinary using SIGNED upload
   * Just like your backend does, but from frontend
   */
  async uploadAudio(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryUploadResult> {
    // Step 1: Get signature from your backend
    const signatureData = await this.getUploadSignature('audio');

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      
      // Add the file
      formData.append('file', file);
      
      // Add signature parameters (signed by your backend)
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      
      // Add optional transformation parameters if provided
      if (signatureData.eager) {
        formData.append('eager', signatureData.eager);
      }
      if (signatureData.transformation) {
        formData.append('transformation', signatureData.transformation);
      }
      if (signatureData.eager_async) {
        formData.append('eager_async', 'true');
      }

      const xhr = new XMLHttpRequest();
      xhr.timeout = 300000; // 5 minutes

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            errorMessage = `Cloudinary error: ${xhr.status}`;
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error - connection interrupted'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out - connection too slow'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Use video endpoint for audio files
      const endpoint = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/video/upload`;
      xhr.open('POST', endpoint);
      xhr.send(formData);
    });
  }

  /**
   * Upload cover image directly to Cloudinary using SIGNED upload
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryUploadResult> {
    // Step 1: Get signature from your backend
    const signatureData = await this.getUploadSignature('image');

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      
      // Add the file
      formData.append('file', file);
      
      // Add signature parameters (signed by your backend)
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folder);
      
      // Add transformation if provided
      if (signatureData.transformation) {
        formData.append('transformation', signatureData.transformation);
      }

      const xhr = new XMLHttpRequest();
      xhr.timeout = 60000; // 1 minute for images

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          let errorMessage = 'Image upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            errorMessage = `Cloudinary error: ${xhr.status}`;
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during image upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Image upload timed out'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Image upload cancelled'));
      });

      // Use image endpoint for images
      const endpoint = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
      xhr.open('POST', endpoint);
      xhr.send(formData);
    });
  }

  /**
   * Get audio duration from file (client-side)
   */
  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'metadata';

      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.floor(audio.duration));
        URL.revokeObjectURL(audio.src);
        audio.remove();
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Failed to load audio metadata'));
      });

      audio.src = URL.createObjectURL(file);
    });
  }
}

export default new CloudinaryUploadService();