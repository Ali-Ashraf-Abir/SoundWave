'use client';
import React from 'react';
import { Music, Heart, Play } from 'lucide-react';
import { Song } from '../types';

interface SearchResultItemProps {
  song: Song;
  likedSongs: Set<number>;
  onToggleLike: (songId: number) => void;
  onPlay: (song: Song) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ song, likedSongs, onToggleLike, onPlay }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-tertiary transition-all group">
      <div className={`w-12 h-12 bg-gradient-to-br ${song.color} rounded flex items-center justify-center`}>
        <Music size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{song.title}</h4>
        <p className="text-sm text-secondary">{song.artist}</p>
      </div>
      <span className="text-sm text-secondary">{song.duration}</span>
      <button
        onClick={() => onToggleLike(song.id)}
        className="opacity-0 group-hover:opacity-100 transition-all"
      >
        <Heart
          size={20}
          fill={likedSongs.has(song.id) ? 'currentColor' : 'none'}
          className={likedSongs.has(song.id) ? 'text-green-500' : 'text-secondary'}
        />
      </button>
      <button
        onClick={() => onPlay(song)}
        className="opacity-0 group-hover:opacity-100 transition-all"
      >
        <Play fill="currentColor" size={20} />
      </button>
    </div>
  );
};

export default SearchResultItem;