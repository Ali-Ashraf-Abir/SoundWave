const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a song title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    artist: {
      type: String,
      required: [true, 'Please provide an artist name'],
      trim: true,
    },
    album: {
      type: String,
      trim: true,
      default: 'Single',
    },
    genre: {
      type: String,
      enum: ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Other'],
      default: 'Other',
    },
    duration: {
      type: Number, // in seconds
      required: true,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    coverImageId: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plays: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    // For streaming metadata
    bitrate: {
      type: String,
      default: '320kbps',
    },
    format: {
      type: String,
      default: 'mp3',
    },
    fileSize: {
      type: Number, // in bytes
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ uploadedBy: 1, createdAt: -1 });
songSchema.index({ genre: 1 });
songSchema.index({ plays: -1 });

// Virtual for formatted duration
songSchema.virtual('formattedDuration').get(function () {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;