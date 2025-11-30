'use client';
import React from 'react';
import { Home, Search, Library, Plus, Upload } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  setShowUploadModal: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, setShowUploadModal }) => {
  return (
    <div className="w-64 flex flex-col" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
          MusicStream
        </h1>
      </div>
      
      <nav className="flex-1 px-3">
        <button
          onClick={() => setCurrentView('home')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all ${
            currentView === 'home' ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <Home size={24} />
          <span className="font-medium">Home</span>
        </button>
        
        <button
          onClick={() => setCurrentView('search')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all ${
            currentView === 'search' ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <Search size={24} />
          <span className="font-medium">Search</span>
        </button>
        
        <button
          onClick={() => setCurrentView('library')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-6 transition-all ${
            currentView === 'library' ? 'bg-elevated text-primary' : 'text-secondary hover:text-primary'
          }`}
        >
          <Library size={24} />
          <span className="font-medium">Your Library</span>
        </button>

        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg mb-2 text-secondary hover:text-primary transition-all"
        >
          <Plus size={24} />
          <span className="font-medium">Create Playlist</span>
        </button>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-secondary hover:text-primary transition-all"
        >
          <Upload size={24} />
          <span className="font-medium">Upload Song</span>
        </button>
      </nav>

      <div className="p-4 m-3 rounded-lg glass">
        <p className="text-sm text-secondary mb-2">Create your first playlist</p>
        <button className="text-sm font-semibold px-4 py-2 rounded-full bg-button hover:bg-brand-hover transition-all">
          Create playlist
        </button>
      </div>
    </div>
  );
};

export default Sidebar;