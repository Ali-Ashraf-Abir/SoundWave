'use client';
import React from 'react';
import { Library } from 'lucide-react';
import { playlists } from '../../data/mockdata';

const LibraryView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Your Library</h2>
      <div className="grid grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-tertiary transition-all cursor-pointer"
          >
            <div className={`w-20 h-20 flex items-center justify-center rounded bg-gradient-to-br ${playlist.color}`}>
              <Library size={32} />
            </div>
            <div>
              <h4 className="font-semibold mb-1">{playlist.name}</h4>
              <p className="text-sm text-secondary">Playlist • {playlist.songs} songs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;