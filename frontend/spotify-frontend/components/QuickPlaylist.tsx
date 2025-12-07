'use client';

import React from 'react';
import { Play, Headphones } from 'lucide-react';
import { Playlist } from '../types';

interface QuickPlaylistProps {
  playlist: Playlist;
  onPlayListClick :(data:string | null)=>void;
}

const QuickPlaylist: React.FC<QuickPlaylistProps> = ({ playlist,onPlayListClick }) => {
  return (
    <button
      className="
        w-full flex items-center gap-3 sm:gap-4
        bg-elevated hover:bg-tertiary rounded-xl
        transition-all group p-2 sm:p-3
        shadow-md hover:shadow-lg
      "
    >
      {/* Cover Image / Icon */}
      <div
        className="
          w-14 h-14 sm:w-20 sm:h-20 rounded-lg
          bg-black/20 flex items-center justify-center
          overflow-hidden flex-shrink-0
        "
      >
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Headphones size={26} className="opacity-80" />
        )}
      </div>

      {/* Playlist Info */}
      <div className="flex-1 overflow-hidden text-left">
        <p className="text-sm sm:text-base font-semibold truncate">
          {playlist.name}
        </p>

        <p className="text-xs sm:text-sm opacity-70 truncate">
          {playlist.songs?.length || 0} songs
        </p>
      </div>

      {/* Hover Play Button */}
      <div
        className="
          opacity-0 group-hover:opacity-100
          transition-opacity flex-shrink-0
        "
      >
        <div
          className="
            w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-button
            flex items-center justify-center
            shadow-custom-lg hover:scale-105 transition-transform
          "
        >
          <Play fill="currentColor" size={18} className="sm:w-5 sm:h-5" />
        </div>
      </div>
    </button>
  );
};

export default QuickPlaylist;
