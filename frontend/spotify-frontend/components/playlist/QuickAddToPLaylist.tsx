// QuickAddToPlaylist.tsx
// This component can be used in your main song browser/player to quickly add songs to playlists

import React, { useState, useEffect } from 'react';
import { Plus, Check, Music } from 'lucide-react';
import { playlistAPI } from './PlaylistApi';
import { Playlist } from '@/types';

interface QuickAddToPlaylistProps {
  songId: string;
  songTitle: string;
  onSuccess?: () => void;
}

const QuickAddToPlaylist: React.FC<QuickAddToPlaylistProps> = ({
  songId,
  songTitle,
  onSuccess,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToId, setAddingToId] = useState<string | null>(null);

  useEffect(() => {
    if (showMenu) {
      loadPlaylists();
    }
  }, [showMenu]);

  const loadPlaylists = async () => {
    setLoading(true);
    try {
      const result = await playlistAPI.getMyPlaylists();
      if (result.success && result.data) {
        setPlaylists(result.data);
      }
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    setAddingToId(playlistId);
    
    try {
      const result = await playlistAPI.addSongToPlaylist(playlistId, songId);
      
      if (result.success) {
        // Update the playlist in state to show it contains the song
        setPlaylists(prev =>
          prev.map((p:any) =>
            p._id === playlistId
              ? { ...p, songs: [...(p.songs || []), { _id: songId, title: songTitle, artist: '' }] }
              : p
          )
        );
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Failed to add song to playlist:', err);
    } finally {
      setAddingToId(null);
    }
  };

  const isSongInPlaylist = (playlist: Playlist) => {
    return playlist.songs?.some(s => s._id === songId) || false;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full hover:bg-tertiary transition-colors"
        title="Add to playlist"
      >
        <Plus size={20} className="text-secondary hover:text-primary" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-elevated rounded-lg shadow-custom-lg py-2 z-50 max-h-80 overflow-y-auto">
            <div className="px-4 py-2 border-b border-default">
              <p className="text-sm font-semibold">Add to playlist</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : playlists.length > 0 ? (
              <div>
                {playlists.map((playlist) => {
                  const isInPlaylist = isSongInPlaylist(playlist);
                  const isAdding = addingToId === playlist._id;

                  return (
                    <button
                      key={playlist._id}
                      onClick={() => !isInPlaylist && !isAdding && handleAddToPlaylist(playlist._id)}
                      disabled={isInPlaylist || isAdding}
                      className="w-full px-4 py-3 text-left hover:bg-tertiary flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-tertiary flex items-center justify-center flex-shrink-0">
                        {playlist.coverImage ? (
                          <img
                            src={playlist.coverImage}
                            alt={playlist.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Music size={20} className="text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{playlist.name}</p>
                        <p className="text-xs text-secondary">
                          {playlist.songs?.length || 0} songs
                        </p>
                      </div>
                      {isAdding ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                      ) : isInPlaylist ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Plus size={16} className="text-secondary" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-secondary">
                <Music size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No playlists yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuickAddToPlaylist;