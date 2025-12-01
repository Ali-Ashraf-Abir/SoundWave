'use client';

import React, { useEffect, useState } from 'react';
import SongCard from '../SongCard';
import QuickPlaylist from '../QuickPlaylist';
import { recentlyPlayed, playlists } from '../../data/mockdata';
import { Song } from '../../types';
import { api } from '@/lib/api';

interface HomeViewProps {
  onPlaySong: (song: Song) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onPlaySong }) => {
  const [trendingSongs, setTrendingSongs] = useState<any>()
  const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState<any>()
  useEffect(() => {
    async function getTrendingSongs() {
      await api.get('/songs/trending').then(data => setTrendingSongs(data.data))
    }

    // async function getRecentlyPlayedSongs() {
    //   await api.get('/songs/recentlyPlayed').then(data => setRecentlyPlayedSongs(data.data))
    // }
    getTrendingSongs()
    // getRecentlyPlayedSongs()
  }, [])
  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Good evening</h2>

      {/* Quick Access Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {playlists.slice(0, 6).map((playlist) => (
          <QuickPlaylist key={playlist.id} playlist={playlist} />
        ))}
      </div>

      {/* Recently Played */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xl sm:text-2xl font-bold">Recently played</h3>
          <button className="text-xs sm:text-sm text-secondary hover:text-primary font-semibold">Show all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {recentlyPlayed.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onPlay={onPlaySong} />
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xl sm:text-2xl font-bold">Trending now</h3>
          <button className="text-xs sm:text-sm text-secondary hover:text-primary font-semibold">Show all</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {trendingSongs?.map((song: any, index: any) => (
            <SongCard key={song._id} song={song} index={index} onPlay={onPlaySong} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeView;