// songTypes.ts
export interface Song {
  id:string;
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  coverImage?: string | undefined;
  genre?: string;
  color:string;
  releaseYear?: number;
  playCount?: number;
  audioFile?: string;
}

export interface SongWithPlaylist extends Song {
  isInPlaylist?: boolean;
}
export interface Playlist {
  id:string;
  _id: string;
  owner:User;
  name: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  coverImage?: string;
  color:string;
  songs?: PlaylistSong[];
  createdBy?: User;
  followers?: string[];
}

export interface PlaylistSong {
  _id:string;
  id: string;        // unique id assigned when added to playlist
  addedAt?: string;  // optional
  song: Song;        // the actual song object
}

export interface User {
  _id: string;
  username: string;
}
export interface UploadFormData {
  title: string;
  artist: string;
  album: string;
  genre?: string;
  audioFile?: File | null;
  coverImage?: File | null;
}

export type ViewType = 'home' | 'search' | 'library'|'mysongs' | 'allsongs';

export interface PlaylistFormData {
  name: string;
  description: string;
  tags: string;
  isPublic: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  isFollowing?: boolean;
  deleted?: boolean;
}