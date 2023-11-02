const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const ERRORS = require('../errorMessages');
const HttpError = require('../controllers/httpError');
const { deleteFileFromS3 } = require('../utils/s3');

const ONE_MONTH = 2678400;

const LIMITS = {
  image: 5 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
};

const MIME_TYPES = {
  image: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'],
  video: ['video/mp4', 'video/x-matroska', 'video/quicktime', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav'],
};

const S3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

function fileFilter(req, file, cb) {
  const allowedMimes = MIME_TYPES[file.fieldname];

  if (allowedMimes && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const errorMessages = [];

    if (!allowedMimes.includes(file.mimetype)) {
      errorMessages.push(ERRORS.CALENDAR.INVALID_FILE_TYPE);
    }

    cb(new HttpError(400, errorMessages), false);
  }
}

exports.uploadFiles = multer({
  storage: multerS3({
    s3: S3,
    bucket: 'wonderbox',
    cacheControl: `max-age=${ONE_MONTH}`,
    acl: 'public-read',
    key: (req, file, cb) => {
      const filePrefix = `${file.fieldname}/${Date.now().toString()}`;
      const filename = `${filePrefix}_${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(LIMITS)),
  },
});

exports.checkFileSize = async (req, res, next) => {
  const files = req.files;

  if (!files) {
    return next();
  }

  try {
    ['image', 'video', 'audio'].forEach(async (type) => {
      if (files[type] && files[type][0]) {
        const uploadedFile = files[type][0];
        const maxSize = LIMITS[type];

        if (uploadedFile && uploadedFile.size > maxSize) {
          await deleteFileFromS3(uploadedFile.key);

          return next(
            new HttpError(
              400,
              `파일 사이즈는 최대 ${maxSize / (1024 * 1024)}MB 입니다.`,
            ),
          );
        }
      }
    });

    next();
  } catch (error) {
    return next(new HttpError(500, ERRORS.CALENDAR.FAILED_UPLOAD));
  }
};
