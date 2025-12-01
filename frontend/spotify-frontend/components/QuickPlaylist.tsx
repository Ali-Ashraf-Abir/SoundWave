'use client';

import React from 'react';
import { Play, Headphones } from 'lucide-react';
import { Playlist } from '../types';

interface QuickPlaylistProps {
  playlist: Playlist;
}

const QuickPlaylist: React.FC<QuickPlaylistProps> = ({ playlist }) => {
  return (
    <button className="flex items-center gap-3 sm:gap-4 bg-elevated rounded hover:bg-tertiary transition-all group p-2 sm:p-0">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br ${playlist.color} flex-shrink-0`}>
        <Headphones size={24} className="sm:w-8 sm:h-8" />
      </div>
      <span className="font-semibold text-sm sm:text-base truncate flex-1 text-left">{playlist.name}</span>
      <div className="mr-2 sm:mr-4 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-button flex items-center justify-center shadow-custom-lg hover:scale-105 transition-all">
          <Play fill="currentColor" size={18} className="sm:w-5 sm:h-5" />
        </div>
      </div>
    </button>
  );
};

export default QuickPlaylist;