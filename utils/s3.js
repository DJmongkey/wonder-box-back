const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ERRORS = require('../errorMessages');
const HttpError = require('../controllers/httpError');

const S3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

exports.deleteFileFromS3 = async (fileKey) => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: 'wonderbox',
      Key: fileKey,
    });
    await S3.send(deleteCommand);

    console.log(`${fileKey} 삭제 완료`);
  } catch (error) {
    console.error(error);
    throw new HttpError(500, ERRORS.PROCESS_ERR);
  }
};
