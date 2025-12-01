const express = require('express');
const router = express.Router();
const {
  uploadSong,
  getSong,
  getAllSongs,
  getTrendingSongs,
  getRecommendedSongs,
  updateSong,
  deleteSong,
  streamSong,
  streamSongHLS,
  getHLSSegment
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllSongs)
  .post(protect, uploadSong);

router.get('/trending', getTrendingSongs);
router.get('/recommended', protect, getRecommendedSongs);

router.route('/:id')
  .get(getSong)
  .put(protect, updateSong)
  .delete(protect, deleteSong);

router.get('/:id/stream', streamSong);
router.get('/:id/stream.m3u8', streamSongHLS);
router.get('/:id/hls/:segment', getHLSSegment);

module.exports = router;