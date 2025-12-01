"use client";

import React, { createContext, useContext, useState } from "react";
import { Song } from "@/types"; // adjust path to your Song type

type SongContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // seconds
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (value: boolean) => void;
  setProgress: (value: number) => void;
  newUpload:boolean;
  setNewUpload:(value:boolean) =>void;
};

const SongContext = createContext<SongContextType | undefined>(undefined);

export const SongProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
const[newUpload,setNewUpload] = useState(false)
  return (
    <SongContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        newUpload,
        setNewUpload,
        setCurrentSong,
        setIsPlaying,
        setProgress,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const useSong = () => {
  const ctx = useContext(SongContext);
  if (!ctx) {
    throw new Error("useSong must be used inside <SongProvider>");
  }
  return ctx;
};
