'use client';

import React from 'react';
import { Music, Heart, Play } from 'lucide-react';
import { Song } from '../types';

interface SearchResultItemProps {
  song: Song;
  likedSongs: Set<string>;
  onToggleLike: (songId: string) => void;
  onPlay: (song: Song) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ song, likedSongs, onToggleLike, onPlay }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-tertiary transition-all group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${song.color} rounded flex items-center justify-center flex-shrink-0`}>
        <Music size={16} className="sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate text-sm sm:text-base">{song.title}</h4>
        <p className="text-xs sm:text-sm text-secondary truncate">{song.artist}</p>
      </div>
      <span className="text-xs sm:text-sm text-secondary hidden sm:block">{song.duration}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(song.id);
        }}
        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
      >
        <Heart
          size={18}
          className={`sm:w-5 sm:h-5 ${likedSongs.has(song.id) ? 'text-green-500' : 'text-secondary'}`}
          fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
        />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay(song);
        }}
        className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
      >
        <Play fill="currentColor" size={18} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default SearchResultItem;