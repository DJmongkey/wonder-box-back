const jwt = require('jsonwebtoken');

const HttpError = require('../controllers/httpError');
const ERRORS = require('../errorMessages');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError(401, ERRORS.AUTH.NOT_FOUND_TOKEN));
  }

  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new HttpError(401, ERRORS.AUTH.INVALID_ACCESS_TOKEN));
    }

    req.user = user;

    return next();
  });
};
