'use client';

import React from 'react';
import { Play } from 'lucide-react';
import SongIcon from './SongIcon';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, index, onPlay }) => {
  return (
    <div
      className="p-3 sm:p-4 bg-secondary rounded-lg hover:bg-tertiary transition-all group cursor-pointer"
      onClick={() => onPlay(song)}
    >
      <div className="relative mb-3 sm:mb-4">
        <div className={`w-full aspect-square bg-gradient-to-br ${song.color} rounded-md flex items-center justify-center shadow-custom-md`}>
          <SongIcon index={index} />
        </div>
        <div className="absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-button shadow-custom-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <Play fill="currentColor" size={18} className="sm:w-5 sm:h-5" />
        </div>
      </div>
      <h4 className="font-semibold mb-1 truncate text-sm sm:text-base">{song.title}</h4>
      <p className="text-xs sm:text-sm text-secondary truncate">{song.artist}</p>
    </div>
  );
};

export default SongCard;