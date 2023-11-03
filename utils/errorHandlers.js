const HttpError = require('../controllers/httpError');
const ERRORS = require('../errorMessages');

exports.handleErrors = (error, next) => {
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message,
    );
    next(new HttpError(400, validationErrors.join(', ')));
  }
  return next(new HttpError(500, ERRORS.PROCESS_ERR));
};
