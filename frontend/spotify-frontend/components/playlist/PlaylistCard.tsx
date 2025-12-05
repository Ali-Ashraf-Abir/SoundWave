// PlaylistCard.tsx
import React, { useState } from 'react';
import { Music, Play, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Playlist } from '@/types';


interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onEdit: (playlist: Playlist) => void;
  onDelete: (playlistId: string) => void;
  isOwner: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ 
  playlist, 
  onClick, 
  onEdit, 
  onDelete, 
  isOwner 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative bg-elevated rounded-lg p-4 hover:bg-tertiary transition-all cursor-pointer hover-lift">
      <div onClick={onClick}>
        <div className="relative mb-4">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt={playlist.name}
              className="w-full aspect-square rounded-lg object-cover"
            />
          ) : (
            <div className="w-full aspect-square rounded-lg bg-tertiary flex items-center justify-center">
              <Music size={48} className="text-secondary" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-brand p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
              <Play size={20} fill="currentColor" />
            </button>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1 truncate">{playlist.name}</h3>
        <p className="text-sm text-secondary truncate">{playlist.description || 'No description'}</p>
        <p className="text-xs text-muted mt-2">{playlist.songs?.length || 0} songs</p>
      </div>

      {isOwner && (
        <div className="absolute top-6 right-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-elevated rounded-lg shadow-custom-lg py-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(playlist);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-tertiary flex items-center gap-3"
              >
                <Edit size={16} />
                Edit Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(playlist._id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-tertiary flex items-center gap-3 text-red-500"
              >
                <Trash2 size={16} />
                Delete Playlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;