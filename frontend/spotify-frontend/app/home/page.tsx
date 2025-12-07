'use client';
import Header from '@/components/Header';
import NowPlayingBar from '@/components/NowPlayingBar';
import Sidebar from '@/components/Sidebar';
import UploadModal from '@/components/UploadModal';
import HomeView from '@/components/views/HomeView';
// import LibraryView from '@/components/views/LibraryView';
// import SearchView from '@/components/views/SearchView';
import { Song, UploadFormData, ViewType } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import MySongsPage from '@/components/views/MySongs';
import { PlaylistsManager } from '@/components/playlist';
import SearchView from '@/components/views/SearchView';

const MusicApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({ title: '', artist: '', album: '' });
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // New state for playlist management
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1);
  
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Updated handlePlaySong to accept playlist
  const handlePlaySong = (song: Song, songList?: Song[]): void => {
    
    
    if (songList && songList.length > 0) {
      
      setPlaylist(songList);
      const index = songList.findIndex(s => s._id === song._id);
      if(index == -1){
        const index = songList.findIndex(s => s._id === song._id);
      }
      
      setCurrentSongIndex(index);
    } else if (playlist.length > 0) {
      const index = playlist.findIndex(s => s._id === song._id);
      if (index !== -1) {
        setCurrentSongIndex(index);
      }
    }


    
    setCurrentSong(song);
    setIsPlaying(true);
    setIsLoading(true);
  };
      
  // Function to play next song
  const playNextSong = (): void => {
    if (playlist.length === 0 || currentSongIndex === -1) return;
    
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    const nextSong = playlist[nextIndex];
    
    if (nextSong) {
      
      setCurrentSongIndex(nextIndex);
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  // Function to play previous song
  const playPreviousSong = (): void => {
    if (playlist.length === 0 || currentSongIndex === -1) return;
    
    const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
    const prevSong = playlist[prevIndex];
    
    if (prevSong) {
      
      setCurrentSongIndex(prevIndex);
      setCurrentSong(prevSong);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  // Optimized for instant playback with progressive loading
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    const setupAudioStream = async () => {
      try {
        setIsLoading(true);

        // Fetch MP3 stream URL (not HLS) for instant playback
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/songs/${currentSong._id}/${user?._id}/stream?quality=high&format=mp3`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stream URL');
        }

        const data = await response.json();
        const streamUrl = data.streamUrl;

        

        // Reset audio element
        audio.pause();
        audio.currentTime = 0;
        
        // Reset duration to prevent NaN display
        setDuration(0);
        setCurrentTime(0);

        // Set the stream URL directly - browser handles progressive download
        audio.src = streamUrl;
        
        // Load metadata but don't wait for entire file
        audio.load();

        // Attempt to play as soon as possible
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(err => {
              console.error('Playback failed:', err);
              setIsPlaying(false);
              setIsLoading(false);
            });
        }

      } catch (error) {
        console.error('Error setting up audio stream:', error);
        setIsPlaying(false);
        setIsLoading(false);
      }
    };

    setupAudioStream();

    return () => {
      // Cleanup
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [currentSong, user]);

  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      
      // Check if duration is valid before setting
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        console.warn('Invalid duration received:', audio.duration);
        setDuration(0);
      }
    };

    const handleDurationChange = () => {
      
      // Double-check duration on duration change event
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      
      setIsPlaying(false);
      // Auto-play next song
      playNextSong();
    };

    const handlePlay = () => {
      
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      
      setIsLoading(true);
    };

    const handleWaiting = () => {
      
      setIsLoading(true);
    };

    const handlePlaying = () => {
      
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
      if (audio.error) {
        console.error('Audio error code:', audio.error.code);
        console.error('Audio error message:', audio.error.message);
      }
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleProgress = () => {
      // Optional: Log buffering progress
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          const percentBuffered = (bufferedEnd / duration) * 100;
          
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('error', handleError);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('progress', handleProgress);
    };
  }, [playlist, currentSongIndex]); // Added dependencies for playNextSong

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    

    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  };

  const toggleLike = (songId: string): void => {
    const newLiked = new Set(likedSongs);
    if (newLiked.has(songId)) {
      newLiked.delete(songId);
    } else {
      newLiked.add(songId);
    }
    setLikedSongs(newLiked);
  };

  const handleUpload = (): void => {
    
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
            {currentView === 'home' && <HomeView onPlaySong={handlePlaySong} currentSong={currentSong} />}
            {currentView === 'search' && (
              <SearchView
                searchQuery={searchQuery}
                likedSongs={likedSongs}
                onToggleLike={toggleLike}
                currentSong={currentSong}
                onPlaySong={handlePlaySong}
                isPlaying = {isPlaying}
              />
            )}
            {currentView === 'library' && <PlaylistsManager onPlaySong={handlePlaySong} currentSong={currentSong}/>}
            {currentView === 'mysongs' && <MySongsPage />}
          </div>
        </div>
      </div>

      {/* Preload metadata for faster playback start */}
      <audio ref={audioRef} preload="metadata" />

      <NowPlayingBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        isLoading={isLoading}
        currentTime={currentTime}
        duration={duration}
        likedSongs={likedSongs}
        onToggleLike={toggleLike}
        onTogglePlayPause={togglePlayPause}
        onNext={playNextSong}
        onPrevious={playPreviousSong}
        onSeek={(time) => {
          if (audioRef.current) {
            
            audioRef.current.currentTime = time;
          }
        }}
        onVolumeChange={(volume) => {
          if (audioRef.current) {
            
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