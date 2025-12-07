// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { generateUploadSignature } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signature', protect, generateUploadSignature);

module.exports = router;