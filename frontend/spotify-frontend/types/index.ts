export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  color: string;
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
}

export type ViewType = 'home' | 'search' | 'library';