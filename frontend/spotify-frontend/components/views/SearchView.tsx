'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SearchResultItem from '../SearchResultItem';

import { Song } from '../../types';
import { api } from '@/lib/api';

interface SearchViewProps {
  searchQuery: string;
  likedSongs: Set<string>;
  isPlaying:boolean;
  currentSong:Song | null;
  onToggleLike: (songId: string) => void;
  onPlaySong: (song: Song) => void;
}

const genres = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 
  'Jazz', 'Classical', 'Country', 'R&B',
  'Indie', 'Metal', 'Folk', 'Blues'
];

const SearchView: React.FC<SearchViewProps> = ({ 
  searchQuery, 
  likedSongs, 
  isPlaying,
  currentSong,
  onToggleLike, 
  onPlaySong 
}) => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Search songs function
  const searchSongs = useCallback(async (query: string, genre?: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (genre) params.append('genre', genre);
      params.append('page', page.toString());
      params.append('limit', '20');

      const queryString = params.toString();
      const endpoint = `/songs${queryString ? `?${queryString}` : ''}`;

      // Call your API
      const response = await api.get(endpoint);
      
      if (page === 1) {
        setSearchResults(response.data || []);
      } else {
        setSearchResults(prev => [...prev, ...(response.data || [])]);
      }
      
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: response.data?.length || 0,
        pages: 1,
      });
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search songs');
      if (page === 1) {
        setSearchResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for search query changes with debounce
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        searchSongs(searchQuery, selectedGenre || undefined, 1);
      }, 300); // Debounce by 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [searchQuery, selectedGenre, searchSongs]);

  // Handle genre selection
  const handleGenreClick = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      if (searchQuery) {
        searchSongs(searchQuery, undefined, 1);
      }
    } else {
      setSelectedGenre(genre);
      searchSongs(searchQuery || '', genre, 1);
    }
  };

  // Load more results
  const loadMore = async () => {
    if (pagination.page >= pagination.pages || loading) return;
    await searchSongs(searchQuery || '', selectedGenre || undefined, pagination.page + 1);
  };

  return (
    <div>
      {!searchQuery ? (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {genres.map((genre, idx) => (
              <button
                key={idx}
                onClick={() => handleGenreClick(genre)}
                className={`aspect-square rounded-lg p-4 sm:p-6 text-left hover:scale-105 transition-all ${
                  selectedGenre === genre 
                    ? 'ring-2 ring-white' 
                    : ''
                } bg-gradient-to-br ${
                  ['from-pink-600 to-purple-600', 'from-red-600 to-orange-600', 
                   'from-blue-600 to-cyan-600', 'from-yellow-600 to-green-600'][idx % 4]
                }`}
              >
                <h3 className="text-lg sm:text-2xl font-bold">{genre}</h3>
              </button>
            ))}
          </div>

          {/* Show filtered results by genre */}
          {selectedGenre && searchResults.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {selectedGenre} Songs {pagination.total > 0 && `(${pagination.total})`}
                </h3>
                <button
                  onClick={() => {
                    setSelectedGenre(null);
                    setSearchResults([]);
                  }}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Clear filter
                </button>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {searchResults.map((song) => (
                  <SearchResultItem
                    currentSong={currentSong}
                    key={song._id}
                    song={song}
                    likedSongs={likedSongs}
                    onToggleLike={onToggleLike}
                    onPlay={onPlaySong}
                  />
                ))}
              </div>

              {pagination.page < pagination.pages && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}

          {selectedGenre && searchResults.length === 0 && !loading && (
            <div className="mt-8 text-center py-12">
              <p className="text-gray-400">No {selectedGenre} songs found</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Search results {pagination.total > 0 && `(${pagination.total})`}
            </h2>
            {selectedGenre && (
              <button
                onClick={() => {
                  setSelectedGenre(null);
                  searchSongs(searchQuery, undefined, 1);
                }}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Clear genre filter
              </button>
            )}
          </div>

          {loading && searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-gray-400">Searching...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => searchSongs(searchQuery, selectedGenre || undefined, 1)}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <>
              <div className="space-y-1 sm:space-y-2">
                {searchResults.map((song) => (
                  <SearchResultItem
                  currentSong={currentSong}
                    key={song.id}
                    song={song}
                    likedSongs={likedSongs}
                    onToggleLike={onToggleLike}
                    onPlay={onPlaySong}
                  />
                ))}
              </div>

              {pagination.page < pagination.pages && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : `Load More (${pagination.page}/${pagination.pages})`}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchView;