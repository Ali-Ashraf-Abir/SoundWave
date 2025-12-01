'use client';

import React, { useState } from 'react';
import { Music, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { Song } from '../types';

interface NowPlayingBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  likedSongs: Set<number>;
  onToggleLike: (songId: number) => void;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const NowPlayingBar: React.FC<NowPlayingBarProps> = ({ 
  currentSong, 
  isPlaying, 
  currentTime,
  duration,
  likedSongs, 
  onToggleLike,
  onTogglePlayPause,
  onSeek,
  onVolumeChange
}) => {
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(x / rect.width, 1));
    setVolume(newVolume);
    onVolumeChange(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const handleVolumeDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingVolume) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newVolume = x / rect.width;
    setVolume(newVolume);
    onVolumeChange(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(volume);
    } else {
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t" 
      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      {/* Mobile Layout */}
      <div className="block sm:hidden">
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-tertiary cursor-pointer"
          onClick={handleProgressClick}
          onMouseDown={() => setIsDraggingProgress(true)}
          onMouseMove={handleProgressDrag}
          onMouseUp={() => setIsDraggingProgress(false)}
          onMouseLeave={() => setIsDraggingProgress(false)}
        >
          <div 
            className="h-full bg-button transition-all" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Main Controls */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Song Info */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-10 h-10 bg-gradient-to-br ${currentSong.color} rounded flex items-center justify-center flex-shrink-0`}>
              <Music size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate text-xs">{currentSong.title}</h4>
              <p className="text-xs text-secondary truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => onToggleLike(currentSong.id)}
              className="flex-shrink-0"
            >
              <Heart
                size={20}
                fill={likedSongs.has(currentSong.id) ? 'currentColor' : 'none'}
                className={likedSongs.has(currentSong.id) ? 'text-green-500' : 'text-secondary'}
              />
            </button>
            <button className="text-secondary hover:text-primary transition-all flex-shrink-0">
              <SkipBack size={20} />
            </button>
            <button
              onClick={onTogglePlayPause}
              className="w-10 h-10 rounded-full bg-button hover:bg-brand-hover transition-all flex items-center justify-center flex-shrink-0"
            >
              {isPlaying ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} />}
            </button>
            <button className="text-secondary hover:text-primary transition-all flex-shrink-0">
              <SkipForward size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="hidden sm:flex items-center px-4 py-3 gap-4">
        {/* Song Info - Left */}
        <div className="flex items-center gap-3 w-80 min-w-0">
          <div className={`w-14 h-14 bg-gradient-to-br ${currentSong.color} rounded flex items-center justify-center flex-shrink-0`}>
            <Music size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate text-sm">{currentSong.title}</h4>
            <p className="text-xs text-secondary truncate">{currentSong.artist}</p>
          </div>
          <button onClick={() => onToggleLike(currentSong.id)} className="flex-shrink-0">
            <Heart
              size={18}
              fill={likedSongs.has(currentSong.id) ? 'currentColor' : 'none'}
              className={likedSongs.has(currentSong.id) ? 'text-green-500' : 'text-secondary hover:text-primary'}
            />
          </button>
        </div>

        {/* Controls - Center */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button className="text-secondary hover:text-primary transition-all">
              <Shuffle size={18} />
            </button>
            <button className="text-secondary hover:text-primary transition-all">
              <SkipBack size={20} />
            </button>
            <button
              onClick={onTogglePlayPause}
              className="w-10 h-10 rounded-full bg-button hover:bg-brand-hover transition-all flex items-center justify-center"
            >
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
            </button>
            <button className="text-secondary hover:text-primary transition-all">
              <SkipForward size={20} />
            </button>
            <button className="text-secondary hover:text-primary transition-all">
              <Repeat size={18} />
            </button>
          </div>
          <div className="w-full max-w-2xl flex items-center gap-2">
            <span className="text-xs text-secondary min-w-[40px] text-right">{formatTime(currentTime)}</span>
            <div 
              className="flex-1 h-1 bg-tertiary rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all group"
              onClick={handleProgressClick}
              onMouseDown={() => setIsDraggingProgress(true)}
              onMouseMove={handleProgressDrag}
              onMouseUp={() => setIsDraggingProgress(false)}
              onMouseLeave={() => setIsDraggingProgress(false)}
            >
              <div 
                className="h-full bg-button rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className="text-xs text-secondary min-w-[40px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume - Right */}
        <div className="hidden lg:flex items-center gap-2 w-80 justify-end">
          <button className="text-secondary hover:text-primary transition-all">
            <MoreHorizontal size={20} />
          </button>
          <button onClick={toggleMute} className="text-secondary hover:text-primary transition-all">
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div 
            className="w-24 h-1 bg-tertiary rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all group"
            onClick={handleVolumeClick}
            onMouseDown={() => setIsDraggingVolume(true)}
            onMouseMove={handleVolumeDrag}
            onMouseUp={() => setIsDraggingVolume(false)}
            onMouseLeave={() => setIsDraggingVolume(false)}
          >
            <div 
              className="h-full bg-button rounded-full relative"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;