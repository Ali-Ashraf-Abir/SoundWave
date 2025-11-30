'use client';

import Header from '@/components/Header';
import NowPlayingBar from '@/components/NowPlayingBar';
import Sidebar from '@/components/Sidebar';
import UploadModal from '@/components/UploadModal';
import HomeView from '@/components/views/HomeView';
import LibraryView from '@/components/views/LibraryView';
import SearchView from '@/components/views/SearchView';
import { Song, UploadFormData, ViewType } from '@/types';
import React, { useState } from 'react';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({ title: '', artist: '', album: '' });
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handlePlaySong = (song: Song): void => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const toggleLike = (songId: number): void => {
    const newLiked = new Set(likedSongs);
    if (newLiked.has(songId)) {
      newLiked.delete(songId);
    } else {
      newLiked.add(songId);
    }
    setLikedSongs(newLiked);
  };

  const handleUpload = (): void => {
    console.log('Uploading song:', uploadForm);
    setShowUploadModal(false);
    setUploadForm({ title: '', artist: '', album: '' });
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          setShowUploadModal={setShowUploadModal}
        />

        <div className="flex-1 overflow-y-auto">
          <Header 
            currentView={currentView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="px-8 py-6">
            {currentView === 'home' && <HomeView onPlaySong={handlePlaySong} />}
            {currentView === 'search' && (
              <SearchView 
                searchQuery={searchQuery}
                likedSongs={likedSongs}
                onToggleLike={toggleLike}
                onPlaySong={handlePlaySong}
              />
            )}
            {currentView === 'library' && <LibraryView />}
          </div>
        </div>
      </div>

      <NowPlayingBar 
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        likedSongs={likedSongs}
        onToggleLike={toggleLike}
      />

      <UploadModal 
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;