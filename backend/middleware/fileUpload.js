const fileUpload = require('express-fileupload');

module.exports = fileUpload({
  useTempFiles: false,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  abortOnLimit: true,
  createParentPath: true,
});