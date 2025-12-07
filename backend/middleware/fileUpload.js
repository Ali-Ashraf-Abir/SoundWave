const fileUpload = require('express-fileupload');

module.exports =fileUpload = {
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded',
  uploadTimeout: 300000,
  debug: process.env.NODE_ENV === 'development',
  parseNested: true,
};
