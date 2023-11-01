const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');

const S3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

exports.upload = multer({
  limits: { fileSize: 2000000 },
  storage: multerS3({
    s3: S3,
    bucket: 'wonderbox',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key(req, file, cb) {
      cb(null, `calendarId_${Date.now()}`);
    },
  }),
});
