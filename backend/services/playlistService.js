const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const cloudinaryService = require('./cloudinaryService');

class PlaylistService {
  /**
   * Create a new playlist
   */
  async createPlaylist(playlistData, userId, coverImageFile) {
    try {
      let coverImage = null;
      let coverImageId = null;

      if (coverImageFile) {
        const imageUpload = await cloudinaryService.uploadImage(coverImageFile.buffer);
        coverImage = imageUpload.secure_url;
        coverImageId = imageUpload.public_id;
      }

      const playlist = await Playlist.create({
        ...playlistData,
        owner: userId,
        coverImage,
        coverImageId,
      });

      return playlist;
    } catch (error) {
      throw new Error(`Failed to create playlist: ${error.message}`);
    }
  }

  /**
   * Get playlist by ID
   */
  async getPlaylistById(playlistId, userId) {
    try {
      const playlist = await Playlist.findById(playlistId)
        .populate('owner', 'name email profileImage')
        .populate({
          path: 'songs.song',
          populate: { path: 'uploadedBy', select: 'name email profileImage' },
        })
        .lean();

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Check if playlist is private and user is not the owner
      if (!playlist.isPublic && playlist.owner._id.toString() !== userId?.toString()) {
        throw new Error('Not authorized to view this playlist');
      }

      return playlist;
    } catch (error) {
      throw new Error(`Failed to get playlist: ${error.message}`);
    }
  }

  /**
   * Get user playlists
   */
  async getUserPlaylists(userId) {
    try {
      const playlists = await Playlist.find({ owner: userId })
        .populate('songs.song', 'title artist coverImage duration')
        .sort('-createdAt')
        .lean();

      return playlists;
    } catch (error) {
      throw new Error(`Failed to get playlists: ${error.message}`);
    }
  }

  /**
   * Add song to playlist
   */
  async addSongToPlaylist(playlistId, songId, userId) {
    try {
      const [playlist, song] = await Promise.all([
        Playlist.findById(playlistId),
        Song.findById(songId),
      ]);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      if (!song) {
        throw new Error('Song not found');
      }

      // Check if user owns the playlist
      if (playlist.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized to modify this playlist');
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some(
        (s) => s.song.toString() === songId.toString()
      );

      if (songExists) {
        throw new Error('Song already in playlist');
      }

      playlist.songs.push({ song: songId });
      await playlist.save();

      return playlist;
    } catch (error) {
      throw new Error(`Failed to add song to playlist: ${error.message}`);
    }
  }

  /**
   * Remove song from playlist
   */
  async removeSongFromPlaylist(playlistId, songId, userId) {
    try {
      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Check if user owns the playlist
      if (playlist.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized to modify this playlist');
      }

      playlist.songs = playlist.songs.filter(
        (s) => s.song.toString() !== songId.toString()
      );

      await playlist.save();

      return playlist;
    } catch (error) {
      throw new Error(`Failed to remove song from playlist: ${error.message}`);
    }
  }

  /**
   * Update playlist
   */
  async updatePlaylist(playlistId, updateData, userId, coverImageFile) {
    try {
      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Check if user owns the playlist
      if (playlist.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized to update this playlist');
      }

      // Update cover image if provided
      if (coverImageFile) {
        if (playlist.coverImageId) {
          await cloudinaryService.deleteFile(playlist.coverImageId, 'image');
        }

        const imageUpload = await cloudinaryService.uploadImage(coverImageFile.buffer);
        updateData.coverImage = imageUpload.secure_url;
        updateData.coverImageId = imageUpload.public_id;
      }

      Object.assign(playlist, updateData);
      await playlist.save();

      return playlist;
    } catch (error) {
      throw new Error(`Failed to update playlist: ${error.message}`);
    }
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId, userId) {
    try {
      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      // Check if user owns the playlist
      if (playlist.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized to delete this playlist');
      }

      // Delete cover image from Cloudinary
      if (playlist.coverImageId) {
        await cloudinaryService.deleteFile(playlist.coverImageId, 'image');
      }

      await playlist.deleteOne();

      return { message: 'Playlist deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete playlist: ${error.message}`);
    }
  }

  /**
   * Follow/Unfollow playlist
   */
  async toggleFollowPlaylist(playlistId, userId) {
    try {
      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      if (!playlist.isPublic) {
        throw new Error('Cannot follow private playlist');
      }

      const isFollowing = playlist.followers.includes(userId);

      if (isFollowing) {
        playlist.followers = playlist.followers.filter(
          (id) => id.toString() !== userId.toString()
        );
      } else {
        playlist.followers.push(userId);
      }

      await playlist.save();

      return {
        isFollowing: !isFollowing,
        followersCount: playlist.followers.length,
      };
    } catch (error) {
      throw new Error(`Failed to toggle follow: ${error.message}`);
    }
  }
}

module.exports = new PlaylistService();