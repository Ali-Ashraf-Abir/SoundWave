'use client';
import React from 'react';
import { Upload } from 'lucide-react';
import { UploadFormData } from '../types';

interface UploadModalProps {
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  uploadForm: UploadFormData;
  setUploadForm: (form: UploadFormData) => void;
  onUpload: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ showUploadModal, setShowUploadModal, uploadForm, setUploadForm, onUpload }) => {
  if (!showUploadModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-secondary rounded-lg p-6 w-full max-w-md shadow-custom-xl">
        <h3 className="text-2xl font-bold mb-6">Upload Song</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Song Title</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter song title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Artist</label>
            <input
              type="text"
              value={uploadForm.artist}
              onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter artist name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              type="text"
              value={uploadForm.album}
              onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-elevated border border-default focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter album name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Audio File</label>
            <div className="border-2 border-dashed border-default rounded-lg p-8 text-center hover:border-green-500 transition-all cursor-pointer">
              <Upload size={32} className="mx-auto mb-2 text-secondary" />
              <p className="text-sm text-secondary">Click to upload or drag and drop</p>
              <p className="text-xs text-muted mt-1">MP3, WAV, or FLAC (MAX. 50MB)</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowUploadModal(false)}
              className="flex-1 px-4 py-2 rounded-full border border-default text-secondary hover:text-primary hover:border-primary transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              className="flex-1 px-4 py-2 rounded-full bg-button hover:bg-brand-hover transition-all font-semibold"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;