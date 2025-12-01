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
import { useAuth } from '@/context/AuthContext';

// Add this loading state to your MusicApp component

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {user}=useAuth()
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const handlePlaySong = (song: Song): void => {
    console.log('Playing song:', song);
    setCurrentSong(song);
    setIsPlaying(true);
    setIsLoading(true); 
  };

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;

    const setupHLS = async () => {
      try {
        setIsLoading(true); // 👈 ADD THIS - Start loading

        // Fetch HLS URL from your backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/songs/${currentSong._id}/${user?._id}/stream?quality=low`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stream URL');
        }

        const data = await response.json();
        const hlsUrl = data.streamUrl;

        console.log('Loading Cloudinary HLS stream from:', hlsUrl);

        // Cleanup previous HLS instance
        if (hlsRef.current) {
          console.log('Destroying previous HLS instance');
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        // Reset audio element
        audio.pause();
        audio.currentTime = 0;

        // Check if HLS.js is supported
        if (Hls.isSupported()) {
          console.log('HLS.js is supported, initializing...');

          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 20,
            maxMaxBufferLength: 120,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            startLevel: -1,
          });

          hlsRef.current = hls;

          hls.attachMedia(audio);

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('HLS media attached');
            hls.loadSource(hlsUrl);
          });

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log('HLS manifest parsed, levels:', data.levels.length);

            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('HLS playback started successfully');
                  setIsPlaying(true);
                  setIsLoading(false); 
                })
                .catch(err => {
                  console.error('HLS playback failed:', err);
                  setIsPlaying(false);
                  setIsLoading(false); 
                });
            }
          });

          hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            console.log('Quality level switched to:', data.level);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);

            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Fatal network error, attempting recovery...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Fatal media error, attempting recovery...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal error, cannot recover');
                  hls.destroy();
                  setIsPlaying(false);
                  setIsLoading(false); // 👈 ADD THIS - Stop loading on fatal error
                  break;
              }
            }
          });

        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Using native HLS support (Safari)');
          audio.src = hlsUrl;
          audio.load();

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Native HLS playback started');
                setIsPlaying(true);
                setIsLoading(false); 
              })
              .catch(err => {
                console.error('Native HLS playback failed:', err);
                setIsPlaying(false);
                setIsLoading(false); 
              });
          }
        } else {
          console.error('HLS is not supported in this browser');
          setIsPlaying(false);
          setIsLoading(false); 
        }

      } catch (error) {
        console.error('Error setting up HLS:', error);
        setIsPlaying(false);
        setIsLoading(false);  
      }
    };

    setupHLS();

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
      setIsLoading(false); // 👈 ADD THIS - Ensure loading stops when playing
    };

    const handlePause = () => {
      console.log('Audio pause event');
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
      setIsLoading(false); // 👈 ADD THIS - Stop loading when ready
    };

    const handleLoadStart = () => {
      console.log('Audio load start');
      setIsLoading(true); // 👈 ADD THIS - Start loading
    };

    const handleWaiting = () => {
      console.log('Audio waiting/buffering');
      setIsLoading(true); // 👈 ADD THIS - Show loading during buffering
    };

    const handlePlaying = () => {
      console.log('Audio playing (playback started after buffering)');
      setIsLoading(false); // 👈 ADD THIS - Stop loading when actually playing
    };

    const handleError = (e: Event) => {
      console.error('Audio element error:', e);
      if (audio.error) {
        console.error('Audio error code:', audio.error.code);
        console.error('Audio error message:', audio.error.message);
      }
      setIsPlaying(false);
      setIsLoading(false); // 👈 ADD THIS
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
            {currentView === 'home' && <HomeView onPlaySong={handlePlaySong} currentSong={currentSong} />}
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

      <audio ref={audioRef} preload="auto" />

      <NowPlayingBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        isLoading={isLoading} 
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