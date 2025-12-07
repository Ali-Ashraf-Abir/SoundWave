const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

ffmpeg.setFfmpegPath(ffmpegPath);

class HLSService {
    constructor() {
        // Directory to store HLS files (temporary)
        this.hlsDir = path.join(__dirname, '../hls-cache');
        this.ensureHLSDirectory();
    }

    async ensureHLSDirectory() {
        try {
            await fs.mkdir(this.hlsDir, { recursive: true });
        } catch (error) {
            console.error('Error creating HLS directory:', error);
        }
    }

    /**
     * Generate HLS playlist and segments from audio URL
     */
    async generateHLS(songId, audioUrl) {
        const songDir = path.join(this.hlsDir, songId);
        const playlistPath = path.join(songDir, 'playlist.m3u8');

        try {
            // Check if HLS already exists
            try {
                await fs.access(playlistPath);
                
                return { playlistPath, songDir };
            } catch {
                // HLS doesn't exist, create it
            }

            // Create song directory
            await fs.mkdir(songDir, { recursive: true });

            // Download audio file temporarily
            const axios = require('axios');
            const response = await axios({
                method: 'GET',
                url: audioUrl,
                responseType: 'stream'
            });

            const tempAudioPath = path.join(songDir, 'temp_audio.mp3');
            const writer = require('fs').createWriteStream(tempAudioPath);
            
            await pipeline(response.data, writer);

            // Generate HLS segments
            await this.convertToHLS(tempAudioPath, songDir);

            // Delete temporary audio file
            await fs.unlink(tempAudioPath);

            return { playlistPath, songDir };
        } catch (error) {
            console.error('Error generating HLS:', error);
            throw error;
        }
    }

    /**
     * Convert audio file to HLS format
     */
    convertToHLS(inputPath, outputDir) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-hls_time 10',              // 10 second segments
                    '-hls_list_size 0',          // Keep all segments in playlist
                    '-hls_segment_type mpegts',  // Use MPEG-TS format
                    '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'),
                    '-c:a aac',                  // Audio codec
                    '-b:a 128k',                 // Audio bitrate
                    '-ar 44100',                 // Sample rate
                    '-ac 2'                      // Stereo
                ])
                .output(path.join(outputDir, 'playlist.m3u8'))
                .on('start', (cmd) => {
                    
                })
                .on('progress', (progress) => {
                    
                })
                .on('end', () => {
                    
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Clean up old HLS files (call this periodically)
     */
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = await fs.readdir(this.hlsDir);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(this.hlsDir, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtimeMs > maxAge) {
                    await fs.rm(filePath, { recursive: true, force: true });
                    
                }
            }
        } catch (error) {
            console.error('Error cleaning up HLS files:', error);
        }
    }
}

module.exports = new HLSService();