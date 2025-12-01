'use client';

import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import SongIcon from './SongIcon';
import { Song } from '../types';
import Image from 'next/image';

interface SongCardProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
  currentSong: Song | null
}

const SongCard: React.FC<SongCardProps> = ({ song, index, onPlay, currentSong }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Song>()



  return (
    <div
      className="p-3 sm:p-4 bg-secondary rounded-lg hover:bg-tertiary transition-all group cursor-pointer"
      onClick={() => {
        if(currentSong?._id!=song._id){
            onPlay(song);
        }
      

      }}
    >
      <div className="relative mb-3 sm:mb-4">
        <div className={`w-full aspect-square bg-gradient-to-br ${song.color} rounded-md flex items-center justify-center shadow-custom-md`}>
          {song.coverImage ? <Image src={song.coverImage} alt={`${song.title}`} fill
            className="object-cover"></Image> : <SongIcon index={index} />}
        </div>
        <div
          className={`
    absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-button shadow-custom-lg flex items-center justify-center transition-all
    ${currentSong && currentSong?._id === song._id
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}
  `}
        >
          {
            currentSong && currentSong?._id == song._id ? <div className="flex items-end gap-[3px] w-4 h-5">
              <span className="w-1 h-2 bg-white animate-eq1 rounded-sm"></span>
              <span className="w-1 h-3 bg-white animate-eq2 rounded-sm"></span>
              <span className="w-1 h-1 bg-white animate-eq3 rounded-sm"></span>
            </div> : ''
          }
        </div>
      </div>
      <h4 className="font-semibold mb-1 truncate text-sm sm:text-base">{song.title}</h4>
      <p className="text-xs sm:text-sm text-secondary truncate">{song.artist}</p>
    </div>
  );
};

export default SongCard;