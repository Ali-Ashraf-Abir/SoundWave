const Song = require('../models/Song');
const User = require('../models/User');
const cloudinaryService = require('./cloudinaryService');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const path = require('path');
const fs = require('fs');
const os = require('os');

class SongService {
    /**
     * Create a new song
     */
    async createSong(songData, audioFile, coverImageFile, userId) {
        try {
            // Read temp file buffer
            const audioBuffer = await fs.promises.readFile(audioFile.tempFilePath);

            // Upload audio to Cloudinary
            const audioUpload = await cloudinaryService.uploadAudio(audioBuffer);

            // Get audio duration
            let duration = 0;
            try {
                duration = Math.floor(await getAudioDurationInSeconds(audioFile.tempFilePath));
            } catch (err) {
                console.error('Error getting duration:', err);
                duration = 180; // default 3 min
            }

            // Upload cover image if provided
            let coverImage = null;
            let coverImageId = null;
            if (coverImageFile) {
                const coverBuffer = await fs.promises.readFile(coverImageFile.tempFilePath);
                const imageUpload = await cloudinaryService.uploadImage(coverBuffer);
                coverImage = imageUpload.secure_url;
                coverImageId = imageUpload.public_id;
            }

            // Create DB record
            const song = await Song.create({
                ...songData,
                audioUrl: audioUpload.secure_url,
                cloudinaryId: audioUpload.public_id,
                coverImage,
                coverImageId,
                uploadedBy: userId,
                duration,
                fileSize: audioFile.size,
                format: audioUpload.format,
            });

            return song;
        } catch (error) {
            throw new Error(`Failed to create song: ${error.message}`);
        }
    }


    /**
     * Get song by ID with streaming URLs
     */
    async getSongById(songId, quality = 'high') {
        try {
            const song = await Song.findById(songId).populate('uploadedBy', 'name email profileImage');

            if (!song) {
                throw new Error('Song not found');
            }

            // Generate streaming URLs for different qualities
            const streamingUrls = {
                low: cloudinaryService.getStreamingUrl(song.cloudinaryId, 'low'),
                medium: cloudinaryService.getStreamingUrl(song.cloudinaryId, 'medium'),
                high: cloudinaryService.getStreamingUrl(song.cloudinaryId, 'high'),
            };

            return {
                ...song.toObject(),
                streamingUrls,
                streamUrl: streamingUrls[quality] || streamingUrls.high,
            };
        } catch (error) {
            throw new Error(`Failed to get song: ${error.message}`);
        }
    }

    /**
     * Get all songs with pagination and filters
     */
    async getAllSongs(filters = {}, page = 1, limit = 20) {
        try {
            const { search, genre, uploadedBy, sortBy = '-createdAt' } = filters;

            const query = { isPublic: true };

            // Search by title, artist, or album
            if (search) {
                query.$text = { $search: search };
            }

            if (genre) {
                query.genre = genre;
            }

            if (uploadedBy) {
                query.uploadedBy = uploadedBy;
            }

            const skip = (page - 1) * limit;

            const [songs, total] = await Promise.all([
                Song.find(query)
                    .populate('uploadedBy', 'name email profileImage')
                    .sort(sortBy)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Song.countDocuments(query),
            ]);

            return {
                songs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw new Error(`Failed to get songs: ${error.message}`);
        }
    }

    /**
     * Update song
     */
    async updateSong(songId, updateData, userId, coverImageFile) {
        try {
            const song = await Song.findById(songId);
            if (!song) throw new Error('Song not found');

            // Authorization
            if (song.uploadedBy.toString() !== userId.toString()) {
                throw new Error('Not authorized to update this song');
            }
            console.log(coverImageFile)
            // --- Update cover image ---
            if (coverImageFile) {
                // Upload image from temp file path
                const coverBuffer = await fs.promises.readFile(coverImageFile.tempFilePath);
                const imageUpload = await cloudinaryService.uploadImage(coverBuffer);


                // Save new cover URL into song document
                song.coverImage = imageUpload.secure_url;
                song.coverImageId = imageUpload.public_id;
            }

            // Update all other fields
            Object.assign(song, updateData);


            // Save to DB
            await song.save();

            return song;
        } catch (error) {
            throw new Error(`Failed to update song: ${error.message}`);
        }
    }


    /**
     * Delete song
     */
    async deleteSong(songId, userId) {
        try {
            const song = await Song.findById(songId);

            if (!song) {
                throw new Error('Song not found');
            }

            // Check if user owns the song
            if (song.uploadedBy.toString() !== userId.toString()) {
                throw new Error('Not authorized to delete this song');
            }

            // Delete from Cloudinary
            await cloudinaryService.deleteFile(song.cloudinaryId, 'video');

            if (song.coverImageId) {
                await cloudinaryService.deleteFile(song.coverImageId, 'image');
            }

            // Delete from database
            await song.deleteOne();

            return { message: 'Song deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete song: ${error.message}`);
        }
    }

    /**
     * Increment play count
     */
    async incrementPlayCount(songId) {
        try {
            await Song.findByIdAndUpdate(songId, { $inc: { plays: 1 } });
        } catch (error) {
            console.error('Failed to increment play count:', error);
        }
    }

    // add song to playlist

    async addToRecentlyPlayed(userId, songId) {
        try {
            await User.findByIdAndUpdate(
                userId,
                {
                    $pull: { recentlyPlayed: songId },   // Remove if exists (avoid duplicates)
                }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        recentlyPlayed: {
                            $each: [songId],
                            $position: 0,   // Insert at the top
                        },
                    },
                }
            );

            // Optional: limit recent list to last 20 songs
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        recentlyPlayed: {
                            $each: [],
                            $slice: 20,
                        },
                    },
                }
            );
        } catch (err) {
            console.error("Failed to update recently played:", err);
        }
    }

    // get recently played songs

    async getRecentlyPlayed(userId, limit = 20) {
        if (!userId) throw new Error("userId is required");

        // Fetch user and populate recentlyPlayed songs
        const user = await User.findById(userId)
            .populate({
                path: "recentlyPlayed",
                options: { sort: { _id: -1 }, limit }, // optional: latest songs first
            })
            .lean();

        if (!user) throw new Error("User not found");

        return user.recentlyPlayed;
    }


    /**
     * Get trending songs
     */
    async getTrendingSongs(limit = 10) {
        try {
            const songs = await Song.find({ isPublic: true })
                .populate('uploadedBy', 'name email profileImage')
                .sort('-plays -createdAt')
                .limit(limit)
                .lean();

            return songs;
        } catch (error) {
            throw new Error(`Failed to get trending songs: ${error.message}`);
        }
    }

    /**
     * Get recommended songs based on user preferences
     */
    async getRecommendedSongs(userId, limit = 10) {
        try {
            const user = await User.findById(userId).populate('likedSongs');

            // Get genres from liked songs
            const likedGenres = user.likedSongs.map(song => song.genre);
            const uniqueGenres = [...new Set(likedGenres)];

            // Find songs in same genres
            const songs = await Song.find({
                isPublic: true,
                genre: { $in: uniqueGenres },
                _id: { $nin: user.likedSongs.map(s => s._id) },
            })
                .populate('uploadedBy', 'name email profileImage')
                .sort('-plays')
                .limit(limit)
                .lean();

            return songs;
        } catch (error) {
            throw new Error(`Failed to get recommended songs: ${error.message}`);
        }
    }
}

module.exports = new SongService();