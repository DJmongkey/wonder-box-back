const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ERRORS = require('../errorMessages');
const HttpError = require('../controllers/httpError');

const ONE_MONTH = 2678400;

const LIMITS = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  audio: 10 * 1024 * 1024,
};

const MIME_TYPES = {
  image: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'],
  video: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/x-matroska',
    'video/quicktime',
  ],
  audio: ['audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
};

const S3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

function filterMimeTypes(req, file, cb) {
  const allowedMimes = MIME_TYPES[file.fieldname];

  if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
    return cb(new HttpError(400, ERRORS.CALENDAR.INVALID_FILE_TYPE), false);
  }

  cb(null, true);
}

exports.uploadFiles = multer({
  storage: multerS3({
    s3: S3,
    bucket: 'wonderbox',
    cacheControl: `max-age=${ONE_MONTH}`,
    acl: 'public-read',
    key: (req, file, cb) => {
      const filePrefix = `${file.fieldname}/${req.params.calendarId}`;
      const filename = `${filePrefix}_${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter: filterMimeTypes,
  limits: {
    fileSize: Math.max(...Object.values(LIMITS)),
  },
});

exports.checkFileSize = async (req, res, next) => {
  const { files } = req;

  if (!files) {
    return next();
  }

  try {
    for (const type of ['image', 'video', 'audio']) {
      const fileList = files[type];

      if (fileList && fileList.length > 0) {
        const uploadedFile = fileList[0];
        const maxSize = LIMITS[type];

        if (uploadedFile.size > maxSize) {
          await deleteFileFromS3(uploadedFile.key);

          return next(
            new HttpError(
              400,
              `파일 사이즈는 최대 ${maxSize / (1024 * 1024)}MB 입니다.`,
            ),
          );
        }
      }
    }

    next();
  } catch (error) {
    return next(new HttpError(500, ERRORS.CALENDAR.FAILED_UPLOAD));
  }
};

exports.deleteFileFromS3 = async (url) => {
  if (!url) {
    return;
  }
  const pathname = decodeURIComponent(new URL(url).pathname);
  const s3Key = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const deleteCommand = new DeleteObjectCommand({
    Bucket: 'wonderbox',
    Key: s3Key,
  });

  try {
    const res = await S3.send(deleteCommand);
    return res;
  } catch (error) {
    throw new HttpError(500, ERRORS.CALENDAR.FAILED_DELETE);
  }
};
