const songService = require('../services/songService');
const asyncHandler = require('express-async-handler');
const hlsService = require('../services/hlsService');
const cloudinaryService = require('../services/cloudinaryService');
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
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

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
    const song = await songService.getSongById(req.params.id);
    const quality = req.query.quality || 'high';

    // Get HLS URL from Cloudinary
    const hlsUrl = cloudinaryService.getStreamingUrl(song.cloudinaryId, quality);
    
    // Redirect to Cloudinary's HLS stream
    res.redirect(hlsUrl);
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