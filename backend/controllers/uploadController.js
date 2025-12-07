// controllers/uploadController.js
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');
exports.generateUploadSignature = asyncHandler(async (req, res) => {
    const { uploadType } = req.body; // 'audio' or 'image'

    const timestamp = Math.round(new Date().getTime() / 1000);
    

    const paramsToSign = {
        timestamp: timestamp,
        folder: uploadType === 'audio' ? 'music-app/audio' : 'music-app/covers',
    };

    if (uploadType === 'audio') {

    } else if (uploadType === 'image') {
        // Simple transformation for images
        paramsToSign.transformation = 'c_fill,h_640,w_640';
    }

    // Generate signature using your API secret (same as backend does)
    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    res.json({
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: paramsToSign.folder,
        eager: paramsToSign.eager,
        transformation: paramsToSign.transformation,
        eager_async: paramsToSign.eager_async,
        resource_type: uploadType === 'audio' ? 'video' : 'image',
    });
});
