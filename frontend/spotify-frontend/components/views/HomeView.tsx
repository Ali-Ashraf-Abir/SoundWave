'use client';

import React, { useEffect, useRef, useState } from 'react';
import SongCard from '../SongCard';
import QuickPlaylist from '../QuickPlaylist';
import { recentlyPlayed, playlists } from '../../data/mockdata';
import { Playlist, Song } from '../../types';
import { api } from '@/lib/api';
import { useSong } from '@/context/SongContext';
import SongCardSkeleton from '../loader/SongCardSkeleton';
import { useAuth } from '@/context/AuthContext';
import { trendingCache, recentCache } from "../../lib/cache"
import { playlistAPI } from '../playlist/PlaylistApi';

interface HomeViewProps {
  onPlaySong: (song: Song, songList: Song[] | undefined) => void;
  currentSong: Song | null
}

const HomeView: React.FC<HomeViewProps> = ({ onPlaySong, currentSong }) => {
  const [trendingSongs, setTrendingSongs] = useState<any>();
  const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState<Song[]>();
  const { setNewUpload, newUpload } = useSong();
  const [loadingTrending, setLoadingTrending] = useState<boolean>(false);
  const [loadingRecentlyPlayed, setLoadingRecentlyPlayed] = useState<boolean>(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false)
  const [playList,setPlaylists]=useState<Playlist[]>()
  // CACHE
  useEffect(() => {
    // Clear caches when newUpload changes
    if (newUpload) {
      trendingCache.current = null;
      recentCache.current = null;
      setNewUpload(false)
    }

    async function getTrendingSongs() {
      if (trendingCache.current) {
        setTrendingSongs(trendingCache.current);
        return;
      }

      setLoadingTrending(true);
      try {
        const res = await api.get("/songs/trending");
        trendingCache.current = res.data;
        setTrendingSongs(res.data);
      } finally {
        setLoadingTrending(false);
      }
    }

    async function getRecentlyPlayedSongs() {
      if (!user?._id) return;

      if (recentCache.current?.userId === user._id) {
        setRecentlyPlayedSongs(recentCache.current.data);
        return;
      }

      setLoadingRecentlyPlayed(true);
      try {
        const res = await api.get(`/songs/user/${user._id}/recently-played`);
        recentCache.current = {
          userId: user._id,
          data: res?.recentlyPlayed,
        };
        setRecentlyPlayedSongs(res?.recentlyPlayed);
      } finally {
        setLoadingRecentlyPlayed(false);
      }
    }

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

    getTrendingSongs();
    if (user) getRecentlyPlayedSongs();
    if (user) loadPlaylists()

  }, [newUpload, user?._id]);

  const handleRecentSongClick = (song: Song) => {
    onPlaySong(song, recentlyPlayedSongs); // Pass the entire list
  };

  // When user clicks a song from trending
  const handleTrendingSongClick = (song: Song) => {
    onPlaySong(song, trendingSongs); // Pass the entire list
  };


  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Good evening</h2>

      {/* Quick Access Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {playList?.slice(0, 6).map((playlist) => (
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
          {recentlyPlayedSongs?.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onPlay={handleRecentSongClick} currentSong={currentSong} />
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
            <SongCard key={song._id} song={song} index={index} onPlay={handleTrendingSongClick} currentSong={currentSong} />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeView;