const express = require('express');
const router = express.Router();
const {
  createPlaylist,
  getPlaylist,
  getUserPlaylists,
  getMyPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  toggleFollowPlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMyPlaylists)
  .post(protect, createPlaylist);

router.get('/user/:userId', getUserPlaylists);

router.route('/:id')
  .get(getPlaylist)
  .put(protect, updatePlaylist)
  .delete(protect, deletePlaylist);

router.post('/:id/songs', protect, addSongToPlaylist);
router.delete('/:id/songs/:songId', protect, removeSongFromPlaylist);
router.post('/:id/follow', protect, toggleFollowPlaylist);

module.exports = router;