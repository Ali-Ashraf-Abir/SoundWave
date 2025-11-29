const jwt = require('jsonwebtoken');

class JWTUtils {
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static sendTokenResponse(user, statusCode, res, message = 'Success') {
    const token = this.generateToken(user._id);

    const options = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const ResponseHandler = require('./response');
    
    return ResponseHandler.success(res, statusCode, message, {
      token,
      user,
    });
  }
}

module.exports = JWTUtils;