// AddSongsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, Music, Plus, Check, TrendingUp, Star } from 'lucide-react';
import { SongWithPlaylist } from '@/types';
import { songAPI } from './SongApi';
import { playlistAPI } from './PlaylistApi';


interface AddSongsModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlistId: string;
    playlistName: string;
    existingSongIds: string[];
    onSongsAdded: () => void;
}

const AddSongsModal: React.FC<AddSongsModalProps> = ({
    isOpen,
    onClose,
    playlistId,
    playlistName,
    existingSongIds,
    onSongsAdded,
}) => {
    const [songs, setSongs] = useState<SongWithPlaylist[]>([]);
    const [filteredSongs, setFilteredSongs] = useState<SongWithPlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'trending' | 'recommended'>('all');
    const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        if (isOpen && existingSongIds) {
            loadSongs();
        }

    }, [isOpen, selectedTab,existingSongIds]);

    useEffect(() => {
        filterSongs();
    }, [searchQuery, songs]);

    const loadSongs = async () => {
        setLoading(true);
        try {
            let result;

            switch (selectedTab) {
                case 'all':
                    result = await songAPI.getAllSongs();
                    break;
                case 'trending':
                    result = await songAPI.getTrendingSongs();
                    break;
                case 'recommended':
                    result = await songAPI.getRecommendedSongs();
                    break;
                default:
                    result = await songAPI.getAllSongs();
            }

            if (result.success && result.data) {
                const songsWithStatus = result.data.map(song => ({
                    ...song,
                    isInPlaylist: existingSongIds.includes(song._id),
                }));
                setSongs(songsWithStatus);
                setFilteredSongs(songsWithStatus);
                
            }
        } catch (err) {
            console.error('Failed to load songs:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const filterSongs = () => {
        if (!searchQuery.trim()) {
            setFilteredSongs(songs);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = songs.filter(
            song =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query) ||
                song.album?.toLowerCase().includes(query) ||
                song.genre?.toLowerCase().includes(query)
        );
        setFilteredSongs(filtered);
    };

    const handleAddSong = async (songId: string) => {
        setAddingIds(prev => new Set(prev).add(songId));

        try {
            const result = await playlistAPI.addSongToPlaylist(playlistId, songId);

            if (result.success) {
                setSongs(prev =>
                    prev.map(song =>
                        song._id === songId ? { ...song, isInPlaylist: true } : song
                    )
                );

                setSuccessMessage('Song added successfully!');
                setTimeout(() => setSuccessMessage(''), 2000);
                onSongsAdded();
            }
        } catch (err) {
            console.error('Failed to add song:', err);
        } finally {
            setAddingIds(prev => {
                const next = new Set(prev);
                next.delete(songId);
                return next;
            });
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-elevated rounded-lg w-full max-w-4xl max-h-[90vh] shadow-custom-xl animate-slideUp flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-default">
                    <div>
                        <h2 className="text-2xl font-bold">Add Songs</h2>
                        <p className="text-sm text-secondary mt-1">to {playlistName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-primary transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mx-6 mt-4 bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded flex items-center gap-2">
                        <Check size={20} />
                        {successMessage}
                    </div>
                )}

                {/* Search and Tabs */}
                <div className="p-6 border-b border-default space-y-4">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary"
                            size={20}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search songs, artists, albums..."
                            className="w-full pl-12 pr-4 py-3 rounded-full bg-tertiary border border-default focus:border-brand outline-none transition-colors"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedTab('all')}
                            className={`px-4 py-2 rounded-full transition-colors ${selectedTab === 'all'
                                    ? 'bg-brand text-white'
                                    : 'bg-tertiary text-secondary hover:text-primary'
                                }`}
                        >
                            All Songs
                        </button>
                        <button
                            onClick={() => setSelectedTab('trending')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${selectedTab === 'trending'
                                    ? 'bg-brand text-white'
                                    : 'bg-tertiary text-secondary hover:text-primary'
                                }`}
                        >
                            <TrendingUp size={16} />
                            Trending
                        </button>
                        <button
                            onClick={() => setSelectedTab('recommended')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${selectedTab === 'recommended'
                                    ? 'bg-brand text-white'
                                    : 'bg-tertiary text-secondary hover:text-primary'
                                }`}
                        >
                            <Star size={16} />
                            Recommended
                        </button>
                    </div>
                </div>

                {/* Songs List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                        </div>
                    ) : filteredSongs.length > 0 ? (
                        <div className="space-y-2">
                            {filteredSongs.map((song) => (
                                <div
                                    key={song._id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-tertiary transition-colors group"
                                >
                                    {/* Album Art */}
                                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-tertiary">
                                        {song.coverImage ? (
                                            <img
                                                src={song.coverImage}
                                                alt={song.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music size={24} className="text-secondary" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Song Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{song.title}</p>
                                        <p className="text-sm text-secondary truncate">{song.artist}</p>
                                    </div>

                                    {/* Album */}
                                    {song.album && (
                                        <div className="hidden md:block text-sm text-secondary truncate max-w-xs">
                                            {song.album}
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {song.duration && (
                                        <div className="hidden sm:block text-sm text-secondary w-16 text-right">
                                            {song.duration}
                                        </div>
                                    )}

                                    {/* Add Button */}
                                    <div className="w-24 flex justify-end">
                                        {song.isInPlaylist ? (
                                            <div className="flex items-center gap-2 text-green-500 text-sm">
                                                <Check size={16} />
                                                <span className="hidden sm:inline">Added</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddSong(song._id)}
                                                disabled={addingIds.has(song._id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                {addingIds.has(song._id) ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span className="hidden sm:inline">Adding...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={16} />
                                                        <span className="hidden sm:inline">Add</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-secondary">
                            <Music size={64} className="mb-4 opacity-50" />
                            <p className="text-lg">No songs found</p>
                            {searchQuery && (
                                <p className="text-sm mt-2">Try adjusting your search</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-default flex justify-between items-center">
                    <p className="text-sm text-secondary">
                        {filteredSongs.filter(s => s.isInPlaylist).length} of {filteredSongs.length} songs added
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-full bg-brand hover:bg-brand-hover transition-colors font-semibold"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSongsModal;