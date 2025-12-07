'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Music, Filter, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Song } from '@/types';

interface AllSongsPageProps {
  onPlaySong: (song: Song, songList: Song[]) => void;
  currentSong: Song | null;
}

const AllSongsPage: React.FC<AllSongsPageProps> = ({ onPlaySong, currentSong }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const genres = ['All', 'Pop', 'Rock', 'Jazz', 'Hip Hop', 'Electronic', 'Classical', 'R&B', 'Country', 'Blues'];
  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title (A-Z)' }
  ];

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: sortBy
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);
      
      const response = await api.get(`/songs?${params.toString()}`);
      setSongs(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedGenre, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setCurrentPage(1);
      fetchSongs();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchSongs();
  }, [currentPage, selectedGenre, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === 'All' ? '' : genre);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = (song: Song) => {
    onPlaySong(song, songs);
  };

  return (
    <div className="min-h-screen bg-primary text-primary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">All Songs</h1>
          <p className="text-secondary">
            {pagination ? `${pagination.totalSongs || songs.length} songs available` : 'Loading...'}
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Search songs, artists, or albums..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-secondary text-primary pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition border-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            {(searchQuery || selectedGenre || sortBy !== 'recent') && (
              <button
                onClick={clearFilters}
                className="text-sm text-secondary hover:text-primary transition"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filters */}
          <div className={`space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            {/* Genre Filter */}
            <div className="flex-1">
              <label className="block text-sm text-secondary mb-2">Genre</label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      (genre === 'All' && !selectedGenre) || selectedGenre === genre
                        ? 'bg-brand text-primary'
                        : 'bg-secondary text-secondary hover:bg-tertiary'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="lg:w-48">
              <label className="block text-sm text-secondary mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full bg-secondary text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand transition border-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters (Desktop) */}
            {(searchQuery || selectedGenre || sortBy !== 'recent') && (
              <button
                onClick={clearFilters}
                className="hidden lg:block text-sm text-secondary hover:text-primary transition whitespace-nowrap mt-6"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
            <p className="text-secondary">Loading songs...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && songs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Music className="w-16 h-16 text-muted mb-4" />
            <h3 className="text-xl font-semibold mb-2">No songs found</h3>
            <p className="text-secondary mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-brand hover:bg-brand-hover rounded-full transition"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Songs Grid */}
        {!loading && songs.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {songs.map((song) => (
                <div
                  key={song._id}
                  className="group bg-secondary rounded-lg p-4 hover:bg-tertiary transition cursor-pointer hover-lift"
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="relative mb-4">
                    <img
                      src={song.coverImage || '/placeholder-album.png'}
                      alt={song.title}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center rounded-lg">
                      <button className="opacity-0 group-hover:opacity-100 w-12 h-12 bg-brand rounded-full flex items-center justify-center hover:scale-110 transition transform">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                    {currentSong?._id === song._id && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-brand rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate text-primary">{song.title}</h3>
                  <p className="text-xs text-secondary truncate">{song.artist}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted">
                    <span>{song.genre}</span>
                    {song.duration && <span>{formatDuration(parseInt(song.duration))}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-brand text-primary'
                              : 'bg-secondary hover:bg-tertiary'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="text-muted">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-secondary rounded-lg hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllSongsPage;