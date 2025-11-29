const authService = require('../services/authService');
const ResponseHandler = require('../utils/response');
const JWTUtils = require('../utils/jwtUtils');

class AuthController {
  // @route   POST /api/auth/register
  // @desc    Register new user
  // @access  Public
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return ResponseHandler.error(
          res,
          400,
          'Please provide name, email and password'
        );
      }

      if (password.length < 6) {
        return ResponseHandler.error(
          res,
          400,
          'Password must be at least 6 characters'
        );
      }

      // Register user
      const user = await authService.register({ name, email, password });

      // Send token response
      return JWTUtils.sendTokenResponse(
        user,
        201,
        res,
        'User registered successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // @route   POST /api/auth/login
  // @desc    Login user
  // @access  Public
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return ResponseHandler.error(
          res,
          400,
          'Please provide email and password'
        );
      }

      // Login user
      const user = await authService.login(email, password);

      // Send token response
      return JWTUtils.sendTokenResponse(
        user,
        200,
        res,
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  // @route   GET /api/auth/profile
  // @desc    Get current user profile
  // @access  Private
  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserById(req.user.id);
      
      return ResponseHandler.success(
        res,
        200,
        'Profile retrieved successfully',
        { user }
      );
    } catch (error) {
      next(error);
    }
  }

  // @route   PUT /api/auth/profile
  // @desc    Update user profile
  // @access  Private
  async updateProfile(req, res, next) {
    try {
      const { name, email, profileImage } = req.body;

      const user = await authService.updateProfile(req.user.id, {
        name,
        email,
        profileImage,
      });

      return ResponseHandler.success(
        res,
        200,
        'Profile updated successfully',
        { user }
      );
    } catch (error) {
      next(error);
    }
  }

  // @route   PUT /api/auth/change-password
  // @desc    Change user password
  // @access  Private
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseHandler.error(
          res,
          400,
          'Please provide current password and new password'
        );
      }

      if (newPassword.length < 6) {
        return ResponseHandler.error(
          res,
          400,
          'New password must be at least 6 characters'
        );
      }

      const user = await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return ResponseHandler.success(
        res,
        200,
        'Password changed successfully',
        { user }
      );
    } catch (error) {
      next(error);
    }
  }

  // @route   DELETE /api/auth/account
  // @desc    Delete user account
  // @access  Private
  async deleteAccount(req, res, next) {
    try {
      await authService.deleteAccount(req.user.id);

      return ResponseHandler.success(
        res,
        200,
        'Account deleted successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();