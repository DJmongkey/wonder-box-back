const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ERRORS = require('../errorMessages');
const HttpError = require('../controllers/httpError');

exports.deleteFileFromS3 = async (fileKey) => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: 'wonderbox',
      Key: fileKey,
    });
    await S3.send(deleteCommand);

    console.log(`${key} 삭제 완료`);
  } catch (error) {
    console.error(error);
    throw new HttpError(500, ERRORS.PROCESS_ERR);
  }
};
