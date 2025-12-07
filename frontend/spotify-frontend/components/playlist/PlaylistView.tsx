// PlaylistView.tsx
import React, { useState, useEffect } from 'react';
import { Music, Heart, Share2, X, Plus } from 'lucide-react';

import AddSongsModal from './AddSongsModal';
import { Playlist, Song } from '@/types';
import { playlistAPI } from './PlaylistApi';

interface PlaylistViewProps {
    playlistId: string;
    userId: string | undefined;
    onBack: () => void;
    onPlaySong: (song: Song, songList: Song[] | undefined) => void;
    currentSong: Song | null

}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, userId, onBack, onPlaySong, currentSong }) => {
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showAddSongsModal, setShowAddSongsModal] = useState(false);

    useEffect(() => {
        loadPlaylist();
    }, [playlistId]);

    const loadPlaylist = async () => {
        try {
            const result = await playlistAPI.getPlaylist(playlistId);
            if (result.success && result.data) {
                setPlaylist(result.data);
                if (userId) {
                    setIsFollowing(result.data.followers?.includes(userId) || false);
                }
            }
        } catch (err) {
            console.error('Failed to load playlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            const result = await playlistAPI.toggleFollowPlaylist(playlistId);
            if (result.success && result.isFollowing !== undefined) {
                setIsFollowing(result.isFollowing);
            }
        } catch (err) {
            console.error('Failed to toggle follow:', err);
        }
    };

    const handleRemoveSong = async (songId: string) => {
        if (!window.confirm('Remove this song from the playlist?')) return;

        try {
            const result = await playlistAPI.removeSongFromPlaylist(playlistId, songId);
            if (result.success) {
                loadPlaylist();
            }
        } catch (err) {
            console.error('Failed to remove song:', err);
        }
    };

    const handleSongsAdded = () => {
        loadPlaylist();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    if (!playlist) return <div>Playlist not found</div>;

    const isOwner = playlist.owner?._id === userId;
    
    return (
        <div className="animate-fadeIn">
            <button onClick={onBack} className="mb-4 text-secondary hover:text-primary flex items-center gap-2">
                ← Back to Playlists
            </button>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-64 h-64 flex-shrink-0">
                    {playlist.coverImage ? (
                        <img
                            src={playlist.coverImage}
                            alt={playlist.name}
                            className="w-full h-full object-cover rounded-lg shadow-custom-lg"
                        />
                    ) : (
                        <div className="w-full h-full bg-tertiary rounded-lg flex items-center justify-center">
                            <Music size={96} className="text-secondary" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-end">
                    <p className="text-sm font-semibold mb-2">PLAYLIST</p>
                    <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
                    <p className="text-secondary mb-4">{playlist.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold">{playlist.createdBy?.username || 'Unknown'}</span>
                        <span>•</span>
                        <span>{playlist.songs?.length || 0} songs</span>
                        <span>•</span>
                        <span>{playlist.followers?.length || 0} followers</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <button className="bg-brand px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                    Play
                </button>
                {isOwner && (
                    <button
                        onClick={() => setShowAddSongsModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-brand text-brand hover:bg-brand hover:text-white transition-colors font-medium"
                    >
                        <Plus size={20} />
                        Add Songs
                    </button>
                )}
                {!isOwner && (
                    <button
                        onClick={handleFollowToggle}
                        className={`p-3 rounded-full border-2 transition-colors ${isFollowing ? 'border-brand text-brand' : 'border-secondary text-secondary hover:border-primary hover:text-primary'
                            }`}
                    >
                        <Heart size={24} fill={isFollowing ? 'currentColor' : 'none'} />
                    </button>
                )}
                <button className="p-3 rounded-full border-2 border-secondary text-secondary hover:border-primary hover:text-primary transition-colors">
                    <Share2 size={24} />
                </button>
            </div>

            <div className="space-y-2">
                {playlist.songs && playlist.songs.length > 0 ? (
                    playlist.songs.map((song, index) => (
                        <div
                            key={song.song._id}
                            onClick={() =>
                                onPlaySong(
                                    song.song,
                                    playlist?.songs?.map(({ song }) => song)
                                )
                            }
                            className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 rounded hover:bg-tertiary group items-center bg-secondary"
                        >
                            <span className="text-secondary w-8 text-center">{index + 1}</span>
                            <div>
                                <p className="font-medium">{song.song.title}</p>
                                <p className="text-sm text-secondary">{song.song.artist}</p>
                            </div>
                            <span className="text-secondary text-sm">{song.song.duration || '3:45'}</span>
                            {isOwner && (
                                <button
                                    onClick={() => handleRemoveSong(song.song._id)}
                                    className="opacity-0 group-hover:opacity-100 text-secondary hover:text-red-500 transition-opacity"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-secondary">
                        <Music size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="mb-4">No songs in this playlist yet</p>
                        {isOwner && (
                            <button
                                onClick={() => setShowAddSongsModal(true)}
                                className="bg-brand px-6 py-3 rounded-full font-semibold hover:bg-brand-hover transition-colors"
                            >
                                Add Your First Song
                            </button>
                        )}
                    </div>
                )}
            </div>

            <AddSongsModal
                isOpen={showAddSongsModal}
                onClose={() => setShowAddSongsModal(false)}
                playlistId={playlistId}
                playlistName={playlist.name}
                existingSongIds={playlist.songs?.map(s => s.song._id) || []}
                onSongsAdded={handleSongsAdded}
            />
        </div>
    );
};

export default PlaylistView;