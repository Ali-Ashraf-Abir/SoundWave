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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-elevated rounded-lg w-full max-w-md shadow-custom-xl animate-slideUp">
        <div className="flex justify-between items-center p-6 border-b border-default">
          <h2 className="text-2xl font-bold">Create Playlist</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover" className="w-32 h-32 rounded-lg object-cover" />
              ) : (
                <div className="w-32 h-32 bg-tertiary rounded-lg flex items-center justify-center">
                  <Music size={48} className="text-secondary" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-brand p-2 rounded-full cursor-pointer hover:bg-brand-hover transition-colors">
                <Upload size={16} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Playlist Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors"
              placeholder="My Awesome Playlist"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors resize-none"
              rows={3}
              placeholder="Add an optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-tertiary border border-default focus:border-brand outline-none transition-colors"
              placeholder="rock, indie, chill (comma separated)"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                formData.isPublic ? 'bg-brand text-white' : 'bg-tertiary text-secondary'
              }`}
            >
              {formData.isPublic ? <Globe size={16} /> : <Lock size={16} />}
              {formData.isPublic ? 'Public' : 'Private'}
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full bg-tertiary text-primary hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="flex-1 px-6 py-3 rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;