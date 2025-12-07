// CreatePlaylistModal.tsx
import React, { useState } from 'react';
import { X, Upload, Music, Lock, Globe } from 'lucide-react';
import { Playlist, PlaylistFormData } from '@/types';
import { playlistAPI } from './PlaylistApi';


interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: (playlist: Playlist) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  onPlaylistCreated 
}) => {
  const [formData, setFormData] = useState<PlaylistFormData>({
    name: '',
    description: '',
    tags: '',
    isPublic: true,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Playlist name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));
      data.append('isPublic', formData.isPublic.toString());
      if (coverImage) data.append('coverImage', coverImage);

      const result = await playlistAPI.createPlaylist(data);
      
      if (result.success && result.data) {
        onPlaylistCreated(result.data);
        onClose();
        resetForm();
      } else {
        setError(result.message || 'Failed to create playlist');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the playlist';
      setError(errorMessage);
      console.error('Create playlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', tags: '', isPublic: true });
    setCoverImage(null);
    setCoverImagePreview(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-elevated rounded-lg w-full max-w-md shadow-custom-xl animate-slideUp max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-default sticky top-0 bg-elevated z-10">
          <h2 className="text-xl sm:text-2xl font-bold">Create Playlist</h2>
          <button 
            onClick={onClose} 
            className="text-secondary hover:text-primary transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Cover Image Upload */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="relative">
              {coverImagePreview ? (
                <img 
                  src={coverImagePreview} 
                  alt="Cover" 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover" 
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-tertiary rounded-lg flex items-center justify-center">
                  <Music size={36} className="sm:w-12 sm:h-12 text-secondary" />
                </div>
              )}
              <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-brand p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-brand-hover transition-colors shadow-lg">
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-secondary text-center">
              Tap to upload cover image
            </p>
          </div>

          {/* Playlist Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Playlist Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors"
              placeholder="My Awesome Playlist"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors resize-none"
              rows={3}
              placeholder="Add an optional description"
              maxLength={500}
            />
            <p className="text-xs text-secondary mt-1">
              {formData.description.length}/500
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors"
              placeholder="rock, indie, chill"
            />
            <p className="text-xs text-secondary mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-tertiary rounded-lg">
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium">Privacy</p>
              <p className="text-xs text-secondary mt-0.5">
                {formData.isPublic ? 'Anyone can see this playlist' : 'Only you can see this playlist'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors text-sm sm:text-base font-medium ${
                formData.isPublic ? 'bg-brand text-white' : 'bg-secondary text-primary'
              }`}
            >
              {formData.isPublic ? (
                <>
                  <Globe size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Public</span>
                </>
              ) : (
                <>
                  <Lock size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Private</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full bg-tertiary text-primary hover:bg-opacity-80 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;