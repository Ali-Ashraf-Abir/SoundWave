// songAPI.ts

import { api } from "@/lib/api";
import { ApiResponse, Song } from "@/types";


export const songAPI = {
  getAllSongs: (): Promise<ApiResponse<Song[]>> => 
    api.get('/songs'),
  
  getSong: (id: string): Promise<ApiResponse<Song>> => 
    api.get(`/songs/${id}`),
  
  getTrendingSongs: (): Promise<ApiResponse<Song[]>> => 
    api.get('/songs/trending'),
  
  getRecommendedSongs: (): Promise<ApiResponse<Song[]>> => 
    api.get('/songs/recommended'),
  
  searchSongs: (query: string): Promise<ApiResponse<Song[]>> => 
    api.get(`/songs?search=${encodeURIComponent(query)}`),
};