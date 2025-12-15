# SoundWave

A full-stack audio streaming platform built to explore modern cloud-based media delivery, adaptive bitrate streaming, and real-time audio playback.

## Overview

SoundWave is a Spotify-inspired music streaming application where users can upload songs, create playlists, discover music from the community, and enjoy seamless audio playback. This project demonstrates real-world implementation of Cloudinary media management, HLS (HTTP Live Streaming), adaptive quality streaming, and full-stack architecture patterns.

## Features

### User Management
- Secure authentication with JWT
- User profiles with customizable settings
- Password management and account deletion

### Music Library
- Upload audio files with automatic cloud processing
- Custom cover art support
- Rich metadata including title, artist, album, genre, and tags
- Browse and search songs by multiple filters
- Trending songs and personalized recommendations
- Recently played history

### Streaming
- HLS adaptive bitrate streaming
- Multiple quality options: low, medium, high, ultra
- Instant playback with chunk-based delivery
- Range request support for seeking
- Direct MP3 streaming fallback

### Playlists
- Create and manage custom playlists
- Add and remove songs dynamically
- Public and private playlist options
- Follow other users' playlists
- Custom playlist cover images

## Tech Stack

### Frontend
- Next.js - React framework with SSR
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- React Query / SWR - Data fetching and caching

### Backend
- Node.js - Runtime environment
- Express - Web framework
- MongoDB with Mongoose - Database and ODM
- JWT - Secure authentication
- Cloudinary - Media storage and processing

### Streaming
- HLS.js - Client-side HLS playback
- Cloudinary Transformations - Audio transcoding and quality variants
- Adaptive Bitrate Streaming - Dynamic quality adjustment

## Project Structure

```
soundwave/
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── backend/
    ├── routes/
    │   ├── authRoutes.js
    │   ├── songRoutes.js
    │   ├── playlistRoutes.js
    │   └── uploadRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── songController.js
    │   ├── playlistController.js
    │   └── uploadController.js
    ├── models/
    ├── services/
    │   ├── authService.js
    │   ├── songService.js
    │   ├── playlistService.js
    │   ├── cloudinaryService.js
    │   └── hlsService.js
    ├── middleware/
    │   └── authMiddleware.js
    └── utils/
        ├── response.js
        └── jwtUtils.js
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/profile           Get current user profile
PUT    /api/auth/profile           Update user profile
PUT    /api/auth/change-password   Change password
DELETE /api/auth/account           Delete account
```

### Songs
```
POST   /api/songs                    Upload new song
POST   /api/songs/metadata           Save song metadata
GET    /api/songs                    Get all songs with filters
GET    /api/songs/:id                Get song by ID
GET    /api/songs/trending           Get trending songs
GET    /api/songs/recommended        Get personalized recommendations
PUT    /api/songs/:id                Update song metadata
DELETE /api/songs/:id                Delete song
GET    /api/songs/:id/:userid/stream Get streaming URL
GET    /api/songs/:id/stream.m3u8    Get HLS playlist
GET    /api/songs/:id/hls/:segment   Get HLS segment
GET    /api/songs/user/:userid/recently-played  Get recently played songs
GET    /api/songs/songs/:id/:userid/stream      Direct stream with range support
```

### Playlists
```
GET    /api/playlists/myplaylist     Get my playlists
POST   /api/playlists/myplaylist     Create new playlist
GET    /api/playlists/user/:userId   Get user's playlists
GET    /api/playlists/:id            Get playlist by ID
PUT    /api/playlists/:id            Update playlist
DELETE /api/playlists/:id            Delete playlist
POST   /api/playlists/:id/songs      Add song to playlist
DELETE /api/playlists/:id/songs/:songId  Remove song from playlist
POST   /api/playlists/:id/follow     Follow or unfollow playlist
```

### Upload
```
POST   /api/upload/signature         Generate Cloudinary upload signature
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/SoundWave?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration (Optional)
MAX_FILE_SIZE=52428800
FILE_UPLOAD_PATH=./public/uploads
```

### Important Security Notes
- Never commit your `.env` file to version control
- Change the `JWT_SECRET` to a strong, random string in production
- Use environment-specific values for `MONGODB_URI` and `CLIENT_URL`
- Keep your Cloudinary credentials secure

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or Atlas account)
- Cloudinary account

### Clone the Repository
```bash
git clone https://github.com/yourusername/soundwave.git
cd soundwave
```

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and add your environment variables (see above).

```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## How It Works

### Upload Flow with Cloudinary Signature
1. Client requests an upload signature from the backend
2. Backend generates a signed request with timestamp and folder path
3. Client uploads directly to Cloudinary using the signature
4. Cloudinary processes the file and generates HLS variants
5. Client sends metadata with Cloudinary URLs back to server
6. Server saves song information to MongoDB

### Streaming Flow
1. Client requests song stream with user ID and quality preference
2. Backend validates song and user, returns appropriate streaming URL
3. For HLS format, Cloudinary provides adaptive bitrate playlist
4. For MP3 format, direct streaming URL with range support
5. HLS.js player handles chunk loading and quality switching
6. Play count and recently played history updated asynchronously

### Playlist Management
1. Users create playlists with custom metadata and optional cover images
2. Songs are added to playlists by reference (song ID)
3. Playlists can be public or private
4. Users can follow other users' public playlists
5. Playlist updates are reflected immediately across all followers

## Key Learnings

This project helped me understand several important concepts:

- **Secure Upload Patterns**: Implementing signed uploads to Cloudinary where the client uploads directly without exposing API secrets on the frontend
- **Cloudinary Integration**: Working with transformation pipelines, automated HLS generation, and managing both audio and image assets
- **Adaptive Streaming**: Converting audio files to multiple quality variants and letting the client choose based on bandwidth
- **Chunk-based Delivery**: Implementing progressive streaming where audio is delivered in segments for instant playback
- **Database Design**: Creating efficient relationships between users, songs, and playlists with proper indexing
- **Authentication Flow**: JWT-based authentication with protected routes and middleware
- **Async Operations**: Non-blocking updates for analytics to prevent performance issues during playback
- **Range Requests**: Supporting HTTP range requests for audio seeking functionality

## Features in Detail

### Audio Quality Options
The platform supports four quality levels:
- **Low**: 64kbps - for slow connections
- **Medium**: 128kbps - balanced quality
- **High**: 256kbps - premium quality
- **Ultra**: 320kbps - maximum quality

### File Upload Constraints
- Maximum audio file size: 50MB
- Supported formats: MP3, WAV, FLAC, M4A
- Cover images automatically resized to 640x640
- All files stored securely on Cloudinary

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- Signed Cloudinary uploads
- User-specific access control for playlists and songs

## Future Improvements

- Audio waveform visualization during playback
- Lyrics integration with time-synchronized display
- Social features including following artists and users
- Offline caching for mobile applications
- Real-time comment system on songs and playlists
- Admin dashboard for content moderation
- Advanced search with filters and sorting options
- Queue management with shuffle and repeat functionality
- Collaborative playlists where multiple users can edit
- Listen history analytics and insights

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify your `MONGODB_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure network connectivity

**Cloudinary Upload Fails**
- Verify all Cloudinary credentials in `.env`
- Check if the file size exceeds limits
- Ensure proper CORS configuration

**JWT Token Invalid**
- Clear browser cookies and login again
- Verify `JWT_SECRET` is set correctly
- Check token expiration settings

**Audio Won't Play**
- Verify the browser supports HLS
- Check if Cloudinary URLs are accessible
- Try different quality settings

## License

MIT License

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

## Contact

For questions or feedback, feel free to reach out or open an issue on GitHub.
