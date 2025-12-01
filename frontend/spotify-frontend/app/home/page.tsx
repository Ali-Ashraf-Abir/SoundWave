'use client';
import Hls from 'hls.js';
import Header from '@/components/Header';
import NowPlayingBar from '@/components/NowPlayingBar';
import Sidebar from '@/components/Sidebar';
import UploadModal from '@/components/UploadModal';
import HomeView from '@/components/views/HomeView';
import LibraryView from '@/components/views/LibraryView';
import SearchView from '@/components/views/SearchView';
import { api } from '@/lib/api';
import { Song, UploadFormData, ViewType } from '@/types';
import React, { useEffect, useRef, useState } from 'react';

const MusicApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({ title: '', artist: '', album: '' });
  const [likedSongs, setLikedSongs] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const handlePlaySong = (song: Song): void => {
    console.log('Playing song:', song);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Handle HLS streaming setup
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;
    
    // Your backend serves direct audio stream, not HLS
    const directUrl = `${process.env.NEXT_PUBLIC_API_URL}/songs/${currentSong._id}/stream`;
    
    console.log('Loading audio from:', directUrl);

    // Cleanup previous HLS instance if exists
    if (hlsRef.current) {
      console.log('Destroying previous HLS instance');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset audio element
    audio.pause();
    audio.src = '';
    audio.currentTime = 0;

    // Set the direct stream URL
    audio.src = directUrl;
    audio.load(); // Important: explicitly load the new source

    // Auto-play when song changes
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Playback started successfully');
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
    }

    // Cleanup on unmount or song change
    return () => {
      if (hlsRef.current) {
        console.log('Cleaning up HLS instance');
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSong]);

  // Handle audio time updates and events
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      console.log('Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      console.log('Audio ended');
      setIsPlaying(false);
    };
    
    const handlePlay = () => {
      console.log('Audio play event');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Audio pause event');
      setIsPlaying(false);
    };
    
    const handleCanPlay = () => {
      console.log('Audio can play');
    };
    
    const handleLoadStart = () => {
      console.log('Audio load start');
    };
    
    const handleWaiting = () => {
      console.log('Audio waiting/buffering');
    };
    
    const handlePlaying = () => {
      console.log('Audio playing (playback started after buffering)');
    };
    
    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
      if (audio.error) {
        console.error('Audio error code:', audio.error.code);
        console.error('Audio error message:', audio.error.message);
      }
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    console.log('Toggle play/pause. Current isPlaying state:', isPlaying);
    console.log('Audio paused:', audioRef.current.paused);

    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
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
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 overflow-y-auto">
          <Header
            currentView={currentView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-28">
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

      {/* Audio element - always present */}
      <audio ref={audioRef} preload="metadata" />

      <NowPlayingBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        likedSongs={likedSongs}
        onToggleLike={toggleLike}
        onTogglePlayPause={togglePlayPause}
        onSeek={(time) => {
          if (audioRef.current) {
            console.log('Seeking to:', time);
            audioRef.current.currentTime = time;
          }
        }}
        onVolumeChange={(volume) => {
          if (audioRef.current) {
            console.log('Volume changed to:', volume);
            audioRef.current.volume = volume;
          }
        }}
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

export default MusicApp;