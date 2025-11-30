import { Song, Playlist } from '../types';

export const recentlyPlayed: Song[] = [
  { id: 1, title: 'Midnight Dreams', artist: 'Luna Eclipse', album: 'Starlight', duration: '3:45', color: 'from-purple-600 to-blue-600' },
  { id: 2, title: 'Electric Soul', artist: 'Neon Waves', album: 'Synthwave', duration: '4:12', color: 'from-yellow-600 to-orange-600' },
  { id: 3, title: 'Ocean Breeze', artist: 'Coastal Vibes', album: 'Horizons', duration: '3:28', color: 'from-cyan-600 to-blue-600' },
  { id: 4, title: 'Urban Jungle', artist: 'City Lights', album: 'Concrete', duration: '3:55', color: 'from-pink-600 to-purple-600' },
];

export const trendingSongs: Song[] = [
  { id: 5, title: 'Stargazer', artist: 'Cosmic Flow', album: 'Galaxy', duration: '4:01', color: 'from-indigo-600 to-purple-600' },
  { id: 6, title: 'Rhythm & Blues', artist: 'Soul Collective', album: 'Groove', duration: '3:33', color: 'from-blue-600 to-cyan-600' },
  { id: 7, title: 'Mountain High', artist: 'Echo Valley', album: 'Peaks', duration: '4:18', color: 'from-green-600 to-emerald-600' },
  { id: 8, title: 'Digital Love', artist: 'Synth Masters', album: 'Binary', duration: '3:47', color: 'from-red-600 to-pink-600' },
];

export const playlists: Playlist[] = [
  { id: 1, name: 'Chill Vibes', songs: 24, color: 'from-purple-600 to-pink-600' },
  { id: 2, name: 'Workout Mix', songs: 32, color: 'from-orange-600 to-red-600' },
  { id: 3, name: 'Focus Flow', songs: 18, color: 'from-blue-600 to-cyan-600' },
  { id: 4, name: 'Party Hits', songs: 45, color: 'from-green-600 to-emerald-600' },
];

export const genres: string[] = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B'];