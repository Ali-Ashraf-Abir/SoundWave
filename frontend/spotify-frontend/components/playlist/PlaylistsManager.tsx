// PlaylistsManager.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Music, Search } from 'lucide-react';
import { Playlist, Song } from '@/types';
import { playlistAPI } from './PlaylistApi';
import PlaylistView from './PlaylistView';
import PlaylistCard from './PlaylistCard';
import CreatePlaylistModal from './CreatePlaylistModal';
import EditPlaylistModal from './EditPlaylistModal';
import { useAuth } from '@/context/AuthContext';
interface PlayListManagerType{
    onPlaySong: (song: Song,songList:Song[] | undefined) => void;
    currentSong: Song | null
}
const PlaylistsManager: React.FC <PlayListManagerType> = ({onPlaySong,currentSong}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const {user}=useAuth()// Replace with actual user ID from your auth

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
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

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists([newPlaylist, ...playlists]);
  };

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
    setPlaylists(playlists.map(p => p._id === updatedPlaylist._id ? updatedPlaylist : p));
  };

  const handleEditClick = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      const result = await playlistAPI.deletePlaylist(playlistId);
      if (result.success) {
        setPlaylists(playlists.filter(p => p._id !== playlistId));
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPlaylist) {
    return (
      <PlaylistView
        onPlaySong = {onPlaySong}
        currentSong = {currentSong}
        playlistId={selectedPlaylist}
        userId={user?._id}
        onBack={() => setSelectedPlaylist(null)}
      />
    );
  }

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-brand px-6 py-3 rounded-full font-semibold hover:bg-brand-hover transition-colors"
        >
          <Plus size={20} />
          Create Playlist
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search playlists..."
            className="w-full pl-12 pr-4 py-3 rounded-full bg-tertiary border border-default focus:border-brand outline-none transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onClick={() => setSelectedPlaylist(playlist._id)}
              onEdit={handleEditClick}
              onDelete={handleDeletePlaylist}
              isOwner={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Music size={64} className="mx-auto mb-4 text-secondary opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
          <p className="text-secondary mb-6">Create your first playlist to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand px-6 py-3 rounded-full font-semibold hover:bg-brand-hover transition-colors"
          >
            Create Playlist
          </button>
        </div>
      )}

      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <EditPlaylistModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlaylist(null);
        }}
        playlist={editingPlaylist}
        onPlaylistUpdated={handlePlaylistUpdated}
      />
    </div>
  );
};

export default PlaylistsManager;