
class ResponseHandler {
  static success(res, statusCode = 200, message = 'Success', data = null) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, statusCode = 500, message = 'Server Error', error = null) {
    const response = {
      success: false,
      message,
    };

    // Only include error details in development mode
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.message || error;
    }

    return res.status(statusCode).json(response);
  }
}

module.exports = ResponseHandler;

