const songService = require('../services/songService');
const asyncHandler = require('express-async-handler');
const hlsService = require('../services/hlsService');
const cloudinaryService = require('../services/cloudinaryService');
const User = require('../models/User');
// @desc    Upload a new song
// @route   POST /api/songs
// @access  Private
exports.uploadSong = asyncHandler(async (req, res) => {
    const { title, artist, album, genre, tags, isPublic } = req.body;

    if (!req.files || !req.files.audio) {
        res.status(400);
        throw new Error('Please provide an audio file');
    }

    const audioFile = req.files.audio;
    const coverImageFile = req.files.coverImage;
    
    

    // Validate audio file
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
    if (!allowedAudioTypes.includes(audioFile.mimetype)) {
        res.status(400);
        throw new Error('Invalid audio file format. Allowed: MP3, WAV, FLAC');
    }

    // Validate file size (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
        res.status(400);
        throw new Error('Audio file too large. Maximum size: 50MB');
    }

    const songData = {
        title,
        artist,
        album,
        genre,
        tags: tags ? JSON.parse(tags) : [],
        isPublic: isPublic !== 'false',
    };

    const song = await songService.createSong(
        songData,
        audioFile,
        coverImageFile,
        req.user._id
    );

    res.status(201).json({
        success: true,
        data: song,
    });
});

// @desc    Get song by ID
// @route   GET /api/songs/:id
// @access  Public
exports.getSong = asyncHandler(async (req, res) => {
    const quality = req.query.quality || 'high';
    const song = await songService.getSongById(req.params.id, quality);

    // Increment play count (don't wait for it)
    songService.incrementPlayCount(req.params.id).catch(console.error);

    res.json({
        success: true,
        data: song,
    });
});

// @desc    Get all songs
// @route   GET /api/songs
// @access  Public
exports.getAllSongs = asyncHandler(async (req, res) => {
    const { search, genre, uploadedBy, sortBy, page = 1, limit = 20 } = req.query;

    const filters = { search, genre, uploadedBy, sortBy };
    const result = await songService.getAllSongs(filters, parseInt(page), parseInt(limit));

    res.json({
        success: true,
        ...result,
    });
});

// @desc    Get trending songs
// @route   GET /api/songs/trending
// @access  Public
exports.getTrendingSongs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await songService.getTrendingSongs(limit);

    res.json({
        success: true,
        data: songs,
    });
});

// @desc    Get recommended songs
// @route   GET /api/songs/recommended
// @access  Private
exports.getRecommendedSongs = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await songService.getRecommendedSongs(req.user._id, limit);

    res.json({
        success: true,
        data: songs,
    });
});

exports.getRecentlyPlayed = asyncHandler(async (req, res) => {
    const userId = req.params.userid;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const recentlyPlayed = await songService.getRecentlyPlayed(userId);

        res.json({
            success: true,
            recentlyPlayed, // array of Song objects
        });
    } catch (err) {
        console.error("Failed to get recently played songs:", err);
        res.status(500).json({ error: err.message || "Failed to get recently played songs" });
    }
});

// @desc    Update song
// @route   PUT /api/songs/:id
// @access  Private
exports.updateSong = asyncHandler(async (req, res) => {
    const coverImageFile = req.files?.coverImage;

    const song = await songService.updateSong(
        req.params.id,
        req.body,
        req.user._id,
        coverImageFile
    );

    res.json({
        success: true,
        data: song,
    });
});

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private
exports.deleteSong = asyncHandler(async (req, res) => {
    const result = await songService.deleteSong(req.params.id, req.user._id);

    res.json({
        success: true,
        ...result,
    });
});

// @desc    Stream song (with range support for seeking)
// @route   GET /api/songs/:id/stream
// @access  Public
exports.streamSong = asyncHandler(async (req, res) => {
    const songId = req.params.id;
    const userId = req.params.userid;
    const quality = req.query.quality || "high";
    const format = req.query.format || "mp3"; // 'mp3' or 'hls'

    if (!songId || !userId) {
        return res.status(400).json({ error: "songId and userId are required" });
    }

    // Fetch song
    const song = await songService.getSongById(songId);
    if (!song) {
        return res.status(404).json({ error: "Song not found" });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Get streaming URL based on format preference
    let streamUrl;
    if (format === 'hls') {
        streamUrl = cloudinaryService.getHLSStreamingUrl(song.cloudinaryId, quality);
    } else {
        // Default to MP3 for instant playback
        streamUrl = cloudinaryService.getStreamingUrl(song.cloudinaryId, quality);
    }

    // Send response immediately with streaming URL
    res.json({
        success: true,
        streamUrl: streamUrl,
        format: format,
        song: {
            id: song._id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            genre: song.genre,
            coverImage: song.coverImage,
            duration: song.duration,
        },
    });

    // Update analytics asynchronously (don't block response)
    songService.incrementPlayCount(songId).catch(console.error);
    songService.addToRecentlyPlayed(user, songId).catch(console.error);
});


exports.streamSongDirect = asyncHandler(async (req, res) => {
    const songId = req.params.id;
    const userId = req.params.userid;
    const quality = req.query.quality || "high";

    if (!songId || !userId) {
        return res.status(400).json({ error: "songId and userId are required" });
    }

    const song = await songService.getSongById(songId);
    if (!song) {
        return res.status(404).json({ error: "Song not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    // Get the Cloudinary URL
    const streamUrl = cloudinaryService.getStreamingUrl(song.cloudinaryId, quality);

    // Fetch from Cloudinary with Range support
    const axios = require('axios');
    const range = req.headers.range;

    try {
        const headers = {};
        if (range) {
            headers.Range = range;
        }

        const response = await axios({
            method: 'GET',
            url: streamUrl,
            responseType: 'stream',
            headers: headers,
        });

        // Set appropriate headers
        res.status(range ? 206 : 200);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Accept-Ranges': 'bytes',
            'Content-Length': response.headers['content-length'],
            'Cache-Control': 'public, max-age=3600',
        });

        if (range && response.headers['content-range']) {
            res.set('Content-Range', response.headers['content-range']);
        }

        // Pipe the stream with small buffer for instant playback
        response.data.pipe(res);

        // Update analytics asynchronously
        songService.incrementPlayCount(songId).catch(console.error);
        songService.addToRecentlyPlayed(user, songId).catch(console.error);

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
});

/**
 * Get all available streaming options for a song
 * Useful for adaptive quality selection
 */
exports.getStreamingOptions = asyncHandler(async (req, res) => {
    const songId = req.params.id;

    const song = await songService.getSongById(songId);
    if (!song) {
        return res.status(404).json({ error: "Song not found" });
    }

    const qualities = ['low', 'medium', 'high', 'ultra'];
    const streamingOptions = {
        mp3: {},
        hls: {},
    };

    qualities.forEach(quality => {
        streamingOptions.mp3[quality] = cloudinaryService.getStreamingUrl(song.cloudinaryId, quality);
        streamingOptions.hls[quality] = cloudinaryService.getHLSStreamingUrl(song.cloudinaryId, quality);
    });

    res.json({
        success: true,
        songId: song._id,
        title: song.title,
        streamingOptions,
        recommended: {
            format: 'mp3', // Fastest startup
            quality: 'high',
            url: streamingOptions.mp3.high,
        },
    });
});

exports.streamSongHLS = asyncHandler(async (req, res) => {
    const song = await songService.getSongById(req.params.id);
    const quality = req.query.quality || 'high';
    const audioUrl = song.streamingUrls[quality];

    try {
        // Generate HLS if not exists
        const { playlistPath, songDir } = await hlsService.generateHLS(
            req.params.id,
            audioUrl
        );

        // Serve the m3u8 playlist
        const playlist = await fs.promises.readFile(playlistPath, 'utf-8');

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(playlist);
    } catch (error) {
        console.error('HLS streaming error:', error);
        res.status(500).json({ error: 'Failed to stream song' });
    }
});


exports.getHLSSegment = asyncHandler(async (req, res) => {
    const { songId, segment } = req.params;
    const segmentPath = path.join(
        hlsService.hlsDir,
        songId,
        segment
    );

    try {
        const segmentData = await fs.promises.readFile(segmentPath);

        res.setHeader('Content-Type', 'video/mp2t');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(segmentData);
    } catch (error) {
        console.error('Segment error:', error);
        res.status(404).json({ error: 'Segment not found' });
    }
});