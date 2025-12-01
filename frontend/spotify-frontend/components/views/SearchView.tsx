'use client';

import React from 'react';
import SearchResultItem from '../SearchResultItem';
import { recentlyPlayed, trendingSongs, genres } from '../../data/mockdata';
import { Song } from '../../types';

interface SearchViewProps {
  searchQuery: string;
  likedSongs: Set<number>;
  onToggleLike: (songId: number) => void;
  onPlaySong: (song: Song) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ searchQuery, likedSongs, onToggleLike, onPlaySong }) => {
  const filteredSongs = searchQuery 
    ? [...recentlyPlayed, ...trendingSongs].filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div>
      {!searchQuery ? (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {genres.map((genre, idx) => (
              <button
                key={idx}
                className={`aspect-square rounded-lg p-4 sm:p-6 text-left hover:scale-105 transition-all bg-gradient-to-br ${
                  ['from-pink-600 to-purple-600', 'from-red-600 to-orange-600', 'from-blue-600 to-cyan-600', 'from-yellow-600 to-green-600'][idx % 4]
                }`}
              >
                <h3 className="text-lg sm:text-2xl font-bold">{genre}</h3>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Search results</h2>
          <div className="space-y-1 sm:space-y-2">
            {filteredSongs?.map((song) => (
              <SearchResultItem
                key={song.id}
                song={song}
                likedSongs={likedSongs}
                onToggleLike={onToggleLike}
                onPlay={onPlaySong}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchView;