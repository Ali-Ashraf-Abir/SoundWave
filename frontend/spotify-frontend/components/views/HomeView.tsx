'use client';
import React from 'react';
import SongCard from '../SongCard';
import QuickPlaylist from '../QuickPlaylist';
import { recentlyPlayed, trendingSongs, playlists } from '../../data/mockdata';
import { Song } from '../../types';

interface HomeViewProps {
  onPlaySong: (song: Song) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPlaySong }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">Good evening</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        {playlists.slice(0, 6).map((playlist) => (
          <QuickPlaylist key={playlist.id} playlist={playlist} />
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Recently played</h3>
          <button className="text-sm text-secondary hover:text-primary font-semibold">Show all</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {recentlyPlayed.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onPlay={onPlaySong} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Trending now</h3>
          <button className="text-sm text-secondary hover:text-primary font-semibold">Show all</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {trendingSongs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onPlay={onPlaySong} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeView;