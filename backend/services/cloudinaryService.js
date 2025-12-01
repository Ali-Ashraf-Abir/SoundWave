const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
    /**
     * Upload audio file to Cloudinary with optimized settings for streaming
     */
    async uploadAudio(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video', // Use 'video' for audio files
                    folder: 'music-app/audio',
                    format: 'mp3', // Convert to mp3 for better compatibility
                    transformation: [
                        {
                            audio_codec: 'mp3',
                            bit_rate: '320k', // High quality
                        },
                    ],
                    eager: [
                        // Create multiple quality versions for adaptive streaming
                        { audio_codec: 'mp3', bit_rate: '128k', format: 'mp3' },
                        { audio_codec: 'mp3', bit_rate: '192k', format: 'mp3' },
                        { audio_codec: 'mp3', bit_rate: '320k', format: 'mp3' },
                    ],
                    eager_async: true,
                    ...options,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    }
    
    /**
     * Upload cover image to Cloudinary
     */
    async uploadImage(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'music-app/covers',
                    transformation: [
                        { width: 640, height: 640, crop: 'fill', quality: 'auto' },
                    ],
                    ...options,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    }

    /**
     * Delete file from Cloudinary
     */
    async deleteFile(publicId, resourceType = 'video') {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Get streaming URL with adaptive quality
     */
    getStreamingUrl(publicId, quality = 'high') {
        const qualitySettings = {
            low: { audio_codec: 'aac', audio_frequency: 22050, bit_rate: '64k' },
            medium: { audio_codec: 'aac', audio_frequency: 44100, bit_rate: '128k' },
            high: { audio_codec: 'aac', audio_frequency: 44100, bit_rate: '192k' },
        };

        const settings = qualitySettings[quality] || qualitySettings.high;

        const hlsUrl = cloudinary.url(publicId, {
            resource_type: 'video', // Cloudinary streams audio via 'video'
            streaming_profile: 'sd', // faster startup
            format: 'm3u8',
            transformation: [
                {
                    audio_codec: settings.audio_codec,
                    audio_frequency: settings.audio_frequency,
                    bit_rate: settings.bit_rate,
                },
            ],
        });

        return hlsUrl;
    }

    /**
     * Get audio metadata
     */
    async getAudioMetadata(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId, {
                resource_type: 'video',
                media_metadata: true,
            });
            return result;
        } catch (error) {
            throw new Error(`Failed to get metadata: ${error.message}`);
        }
    }
}



module.exports = new CloudinaryService();