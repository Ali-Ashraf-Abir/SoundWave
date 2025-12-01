export interface Song {
  id: number;
  _id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  color: string;
  audioUrl: string;
}

export interface Playlist {
  id: number;
  name: string;
  songs: number;
  color: string;
}

export interface UploadFormData {
  title: string;
  artist: string;
  album: string;
  genre?: string;
  audioFile?: File | null;
  coverImage?: File | null;
}

export type ViewType = 'home' | 'search' | 'library';