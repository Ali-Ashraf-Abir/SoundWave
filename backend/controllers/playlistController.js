const playlistService = require('../services/playlistService');
const asyncHandler = require('express-async-handler');

// @desc    Create playlist
// @route   POST /api/playlists
// @access  Private
exports.createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, tags, isPublic } = req.body;
  const coverImageFile = req.files?.coverImage;

  const playlistData = {
    name,
    description,
    tags: tags ? JSON.parse(tags) : [],
    isPublic: isPublic !== 'false',
  };

  const playlist = await playlistService.createPlaylist(
    playlistData,
    req.user._id,
    coverImageFile
  );

  res.status(201).json({
    success: true,
    data: playlist,
  });
});

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Public
exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await playlistService.getPlaylistById(
    req.params.id,
    req.user?._id
  );

  res.json({
    success: true,
    data: playlist,
  });
});

// @desc    Get user playlists
// @route   GET /api/playlists/user/:userId
// @access  Public
exports.getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await playlistService.getUserPlaylists(req.params.userId);

  res.json({
    success: true,
    data: playlists,
  });
});

// @desc    Get my playlists
// @route   GET /api/playlists/me
// @access  Private
exports.getMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await playlistService.getUserPlaylists(req.user._id);
  console.log(req.user._id)
  res.json({
    success: true,
    data: playlists,
  });
});

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
exports.addSongToPlaylist = asyncHandler(async (req, res) => {
  const { songId } = req.body;

  const playlist = await playlistService.addSongToPlaylist(
    req.params.id,
    songId,
    req.user._id
  );

  res.json({
    success: true,
    data: playlist,
  });
});

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
exports.removeSongFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await playlistService.removeSongFromPlaylist(
    req.params.id,
    req.params.songId,
    req.user._id
  );

  res.json({
    success: true,
    data: playlist,
  });
});

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
exports.updatePlaylist = asyncHandler(async (req, res) => {
const coverImageFile = req.files?.coverImage;
const playlist = await playlistService.updatePlaylist(
req.params.id,
req.body,
req.user._id,
coverImageFile
);
res.json({
success: true,
data: playlist,
});
});
// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
exports.deletePlaylist = asyncHandler(async (req, res) => {
const result = await playlistService.deletePlaylist(
req.params.id,
req.user._id
);
res.json({
success: true,
...result,
});
});
// @desc    Follow/Unfollow playlist
// @route   POST /api/playlists/:id/follow
// @access  Private
exports.toggleFollowPlaylist = asyncHandler(async (req, res) => {
const result = await playlistService.toggleFollowPlaylist(
req.params.id,
req.user._id
);
res.json({
success: true,
...result,
});
});