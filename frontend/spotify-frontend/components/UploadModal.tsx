'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Music, Image, Loader2, CheckCircle } from 'lucide-react';
import { UploadFormData } from '../types';
import Cookies from 'js-cookie';
import { useSong } from '@/context/SongContext';
interface UploadModalProps {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  uploadForm: UploadFormData;
  setUploadForm: (form: UploadFormData) => void;
  onUpload: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  showUploadModal, 
  setShowUploadModal, 
  uploadForm, 
  setUploadForm, 
  onUpload 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'processing' | 'complete'>('uploading');
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const {setNewUpload,newUpload} = useSong()
  if (!showUploadModal) return null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid audio format. Please use MP3, WAV, or FLAC');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('File too large. Maximum size is 50MB');
        return;
      }

      setError(null);
      setUploadForm({ ...uploadForm, audioFile: file });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid image format. Please use JPG, PNG, or WebP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image too large. Maximum size is 5MB');
        return;
      }

      setError(null);
      setUploadForm({ ...uploadForm, coverImage: file });
    }
  };

  const handleSubmit = async () => {
    if (!uploadForm.title || !uploadForm.artist) {
      setError('Please fill in title and artist');
      return;
    }

    if (!uploadForm.audioFile) {
      setError('Please select an audio file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStage('uploading');

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('artist', uploadForm.artist);
      formData.append('album', uploadForm.album || 'Single');
      formData.append('genre', uploadForm.genre || 'Other');
      formData.append('audio', uploadForm.audioFile);
      
      if (uploadForm.coverImage) {
        formData.append('coverImage', uploadForm.coverImage);
      }

      // Get auth token from localStorage or your auth system
      const token = Cookies.get('accessToken');

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
          
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            
            
            setUploadStage('complete');
            setUploadProgress(100);
            setNewUpload(!newUpload)
            // Success! Close modal and reset
            setTimeout(() => {
              setShowUploadModal(false);
              setUploadForm({ title: '', artist: '', album: '', audioFile: null, coverImage: null });
              setUploading(false);
              setUploadProgress(0);
              setUploadStage('uploading');
              onUpload();
            }, 1500);
          } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Invalid server response');
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${xhr.status}`;
          }
          throw new Error(errorMessage);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        console.error('XHR network error');
        setError('Network error occurred during upload');
        setUploading(false);
        setUploadProgress(0);
        setUploadStage('uploading');
      });

      xhr.addEventListener('abort', () => {
        
        setError('Upload cancelled');
        setUploading(false);
        setUploadProgress(0);
        setUploadStage('uploading');
      });

      // When upload completes but server still processing, show processing stage
      xhr.upload.addEventListener('load', () => {
        if (xhr.readyState !== 4) {
          setUploadStage('processing');
          setUploadProgress(100);
          
        }
      });

      // Open connection and send
      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/songs`);
      
      // Set authorization header if needed
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload song');
      setUploading(false);
      setUploadProgress(0);
      setUploadStage('uploading');
    }
  };

  const handleClose = () => {
    if (uploading) {
      // Cancel ongoing upload
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    }
    setShowUploadModal(false);
    setError(null);
    setUploadProgress(0);
    setUploadStage('uploading');
    setUploading(false);
  };

  const getProgressText = () => {
    switch (uploadStage) {
      case 'uploading':
        return `Uploading... ${uploadProgress}%`;
      case 'processing':
        return 'Processing audio...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Uploading...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary rounded-lg p-4 sm:p-6 w-full max-w-md shadow-custom-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold">Upload Song</h3>
          <button 
            onClick={handleClose}
            className="text-secondary hover:text-primary"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Song Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              disabled={uploading}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base disabled:opacity-50"
              placeholder="Enter song title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Artist <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadForm.artist}
              onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
              disabled={uploading}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base disabled:opacity-50"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              type="text"
              value={uploadForm.album}
              onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
              disabled={uploading}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base disabled:opacity-50"
              placeholder="Enter album name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <select
              value={uploadForm.genre || 'Other'}
              onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
              disabled={uploading}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base disabled:opacity-50"
            >
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Electronic">Electronic</option>
              <option value="Country">Country</option>
              <option value="R&B">R&B</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Audio File <span className="text-red-500">*</span>
            </label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/flac"
              onChange={handleAudioChange}
              disabled={uploading}
              className="hidden"
            />
            <div
              onClick={() => !uploading && audioInputRef.current?.click()}
              className={`border-2 border-dashed border-default rounded-lg p-6 sm:p-8 text-center hover:border-green-500 transition-all ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {uploadForm.audioFile ? (
                <div className="flex items-center justify-center gap-2">
                  <Music size={24} className="text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-primary">
                      {uploadForm.audioFile.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {(uploadForm.audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={28} className="mx-auto mb-2 text-secondary" />
                  <p className="text-xs sm:text-sm text-secondary">Click to upload audio file</p>
                  <p className="text-xs text-muted mt-1">MP3, WAV, or FLAC (MAX. 50MB)</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image (Optional)</label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={uploading}
              className="hidden"
            />
            <div
              onClick={() => !uploading && imageInputRef.current?.click()}
              className={`border-2 border-dashed border-default rounded-lg p-6 text-center hover:border-green-500 transition-all ${uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {uploadForm.coverImage ? (
                <div className="flex items-center justify-center gap-2">
                  <Image size={24} className="text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-primary">
                      {uploadForm.coverImage.name}
                    </p>
                    <p className="text-xs text-secondary">
                      {(uploadForm.coverImage.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Image size={24} className="mx-auto mb-2 text-secondary" />
                  <p className="text-xs text-secondary">Click to upload cover image</p>
                  <p className="text-xs text-muted mt-1">JPG, PNG, or WebP (MAX. 5MB)</p>
                </>
              )}
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary">{getProgressText()}</span>
                {uploadStage === 'uploading' && (
                  <span className="text-primary font-semibold">{uploadProgress}%</span>
                )}
              </div>
              <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    uploadStage === 'processing' 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 animate-pulse' 
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: uploadStage === 'processing' ? '100%' : `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              disabled={uploadStage === 'processing'}
              className="flex-1 px-4 py-2 rounded-full border border-default text-secondary hover:text-primary hover:border-primary transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Cancel' : 'Close'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || !uploadForm.title || !uploadForm.artist || !uploadForm.audioFile}
              className="flex-1 px-4 py-2 rounded-full bg-button hover:bg-brand-hover transition-all font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadStage === 'complete' ? (
                <>
                  <CheckCircle size={18} />
                  Done!
                </>
              ) : uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {uploadStage === 'processing' ? 'Processing...' : `${uploadProgress}%`}
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;