SoundWave

Audio streaming platform built to explore Cloudinary, HLS streaming, and chunk-based audio delivery.

Overview

SoundWave is a full-stack audio streaming platform where users can upload songs, stream tracks with HLS, create playlists, and enjoy music uploaded by the community.
This project was created mainly to learn and apply real-world concepts like Cloudinary uploads, HLS transcoding, chunk-based streaming, and full-stack architecture.

Features

• User authentication and profile management
• Upload audio with Cloudinary
• HLS streaming with chunked delivery
• Dynamic audio player with stream buffering
• Create, edit and delete playlists
• Browse and listen to songs uploaded by others
• Responsive UI with smooth interactions

Tech Stack

Frontend
• Next.js
• TypeScript
• Tailwind CSS
• React Query / SWR (if used)

Backend
• Node.js
• Express
• Cloudinary for storage + HLS processing
• MongoDB with Mongoose
• JWT authentication

Streaming
• HLS (HTTP Live Streaming)
• Cloudinary transformations for .m3u8 + chunk generation

Project Structure

High-level overview
frontend/
pages/
components/
hooks/
utils/

backend/
routes/
controllers/
models/
services/cloudinary.js
services/hls.js

How It Works

User uploads an audio file

The server sends it to Cloudinary

Cloudinary transforms it into an HLS playlist (.m3u8) and multiple .ts chunks

The client plays the stream using the HLS.js player

Backend exposes APIs for songs, playlists, and user data

API Endpoints

Authentication
POST /auth/register
POST /auth/login

Songs
POST /songs/upload
GET /songs
GET /songs/:id

Playlists
POST /playlists
GET /playlists/:id
PATCH /playlists/:id
DELETE /playlists/:id

Environment Variables

Create a .env file and configure the following

MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Installation

Clone the repository
git clone https://github.com/yourusername/soundwave.git

Install frontend
cd frontend
npm install
npm run dev

Install backend
cd backend
npm install
npm run dev

Highlights / What I Learned

• Handling Cloudinary upload signatures securely
• Converting audio into adaptive bitrate HLS streams
• Streaming audio by chunk instead of delivering full files
• Managing playlists and song metadata in MongoDB
• Building a full-stack media experience like Spotify-lite

Future Improvements

• Better audio waveform UI
• Lyrics integration
• Follow/like system for artists
• Offline caching
• Real-time comments
• Admin dashboard

License

MIT License
