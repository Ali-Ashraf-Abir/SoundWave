'use client';

import React, { useEffect, useState } from 'react';
import SongCard from '../SongCard';
import QuickPlaylist from '../QuickPlaylist';
import { recentlyPlayed, playlists } from '../../data/mockdata';
import { Song } from '../../types';
import { api } from '@/lib/api';
import { useSong } from '@/context/SongContext';
import SongCardSkeleton from '../loader/SongCardSkeleton';
import { useAuth } from '@/context/AuthContext';

interface HomeViewProps {
  onPlaySong: (song: Song) => void;
  currentSong: Song | null
}

const HomeView: React.FC<HomeViewProps> = ({ onPlaySong, currentSong }) => {
  const [trendingSongs, setTrendingSongs] = useState<any>()
  const [recentlyPlaytedSongs, setRecentlyPlayedSongs] = useState<Song[]>()
  const { setNewUpload, newUpload } = useSong()
  const [loadingTrending, setLoadingTrending] = useState<boolean>(false)
  const [loadingRecentlyPLayed, setLoadingRecentlyPLayed] = useState<boolean>(false)
  const {user}=useAuth()
  useEffect(() => {

    async function getTrendingSongs() {
      setLoadingTrending(true)
      await api.get('/songs/trending').then(data => {
        setTrendingSongs(data.data)

      })
      setLoadingTrending(false)
    }
    async function getRecentlyPlayedSongs(){
      setLoadingRecentlyPLayed(true)
      await api.get(`/songs/user/${user?._id}/recently-played`).then(data => {
        setRecentlyPlayedSongs(data.recentlyPlayed)

      })
      setLoadingTrending(false)
    }

    // async function getRecentlyPlayedSongs() {
    //   await api.get('/songs/recentlyPlayed').then(data => setRecentlyPlayedSongs(data.data))
    // }
    if(user){
      getRecentlyPlayedSongs()
    }
    getTrendingSongs()

    // getRecentlyPlayedSongs()
  }, [setNewUpload, newUpload,user])


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
          {recentlyPlaytedSongs?.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onPlay={onPlaySong} currentSong={currentSong} />
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xl sm:text-2xl font-bold">Trending now</h3>
          <button className="text-xs sm:text-sm text-secondary hover:text-primary font-semibold">Show all</button>
        </div>
        {loadingTrending && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">

          {trendingSongs?.map((song: any, index: any) => (
            <SongCard key={song._id} song={song} index={index} onPlay={onPlaySong} currentSong={currentSong} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeView;