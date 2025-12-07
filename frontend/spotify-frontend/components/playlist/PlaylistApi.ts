// playlistAPI.ts

import { api } from "@/lib/api";
import { ApiResponse, Playlist } from "@/types";


export const playlistAPI = {
  createPlaylist: (formData: FormData): Promise<ApiResponse<Playlist>> => 
    api.post('/playlists/myplaylist', formData),
  
  getMyPlaylists: (): Promise<ApiResponse<Playlist[]>> => 
    api.get('/playlists/myplaylist'),
  
  getPlaylist: (id: string): Promise<ApiResponse<Playlist>> => 
    api.get(`/playlists/${id}`),
  
  updatePlaylist: (id: string, formData: FormData): Promise<ApiResponse<Playlist>> => 
    api.put(`/playlists/${id}`, formData),
  
  deletePlaylist: (id: string): Promise<ApiResponse<null>> => 
    api.delete(`/playlists/${id}`),
  
  addSongToPlaylist: (playlistId: string, songId: string): Promise<ApiResponse<Playlist>> => 
    api.post(`/playlists/${playlistId}/songs`, { songId }),
  
  removeSongFromPlaylist: (playlistId: string, songId: string): Promise<ApiResponse<Playlist>> => 
    api.delete(`/playlists/${playlistId}/songs/${songId}`),
  
  toggleFollowPlaylist: (id: string): Promise<ApiResponse<null>> => 
    api.post(`/playlists/${id}/follow`, {}),
};