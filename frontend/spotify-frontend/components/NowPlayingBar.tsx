'use client';
import React from 'react';
import { Music, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, MoreHorizontal, Volume2 } from 'lucide-react';
import { Song } from '../types';

interface NowPlayingBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  likedSongs: Set<number>;
  onToggleLike: (songId: number) => void;
}

const NowPlayingBar: React.FC<NowPlayingBarProps> = ({ currentSong, isPlaying, setIsPlaying, likedSongs, onToggleLike }) => {
  if (!currentSong) return null;

  return (
    <div className="h-24 border-t flex items-center px-4 gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-4 w-80">
        <div className={`w-14 h-14 bg-gradient-to-br ${currentSong.color} rounded flex items-center justify-center`}>
          <Music size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{currentSong.title}</h4>
          <p className="text-sm text-secondary truncate">{currentSong.artist}</p>
        </div>
        <button onClick={() => onToggleLike(currentSong.id)}>
          <Heart
            size={20}
            fill={likedSongs.has(currentSong.id) ? 'currentColor' : 'none'}
            className={likedSongs.has(currentSong.id) ? 'text-green-500' : 'text-secondary hover:text-primary'}
          />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <button className="text-secondary hover:text-primary transition-all">
            <Shuffle size={20} />
          </button>
          <button className="text-secondary hover:text-primary transition-all">
            <SkipBack size={20} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-button hover:bg-brand-hover transition-all flex items-center justify-center"
          >
            {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
          </button>
          <button className="text-secondary hover:text-primary transition-all">
            <SkipForward size={20} />
          </button>
          <button className="text-secondary hover:text-primary transition-all">
            <Repeat size={20} />
          </button>
        </div>
        <div className="w-full max-w-2xl flex items-center gap-2">
          <span className="text-xs text-secondary">1:23</span>
          <div className="flex-1 h-1 bg-tertiary rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-button rounded-full"></div>
          </div>
          <span className="text-xs text-secondary">{currentSong.duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-80 justify-end">
        <button className="text-secondary hover:text-primary transition-all">
          <MoreHorizontal size={20} />
        </button>
        <Volume2 size={20} className="text-secondary" />
        <div className="w-24 h-1 bg-tertiary rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-button rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NowPlayingBar;