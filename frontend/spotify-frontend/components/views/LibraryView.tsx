'use client';

import React from 'react';
import { Library } from 'lucide-react';
import { playlists } from '../../data/mockdata';

const LibraryView: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Library</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary rounded-lg hover:bg-tertiary transition-all cursor-pointer"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded bg-gradient-to-br ${playlist.color} flex-shrink-0`}>
              <Library size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold mb-1 truncate text-sm sm:text-base">{playlist.name}</h4>
              <p className="text-xs sm:text-sm text-secondary">Playlist • {playlist.songs} songs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;