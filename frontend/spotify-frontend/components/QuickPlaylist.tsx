'use client';
import React from 'react';
import { Play, Headphones } from 'lucide-react';
import { Playlist } from '../types';

interface QuickPlaylistProps {
  playlist: Playlist;
}

const QuickPlaylist: React.FC<QuickPlaylistProps> = ({ playlist }) => {
  return (
    <button className="flex items-center gap-4 bg-elevated rounded hover:bg-tertiary transition-all group">
      <div className={`w-20 h-20 flex items-center justify-center bg-gradient-to-br ${playlist.color}`}>
        <Headphones size={32} />
      </div>
      <span className="font-semibold">{playlist.name}</span>
      <div className="ml-auto mr-4 opacity-0 group-hover:opacity-100 transition-all">
        <div className="w-12 h-12 rounded-full bg-button flex items-center justify-center shadow-custom-lg hover:scale-105 transition-all">
          <Play fill="currentColor" size={20} />
        </div>
      </div>
    </button>
  );
};

export default QuickPlaylist;