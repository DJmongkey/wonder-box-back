const jwt = require('jsonwebtoken');
const HttpError = require('../controllers/httpError');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError(401, 'Token을 찾을 수 없습니다.'));
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new HttpError(401, '유효하지 않은 Token입니다.'));

    req.user = user;
    next();
  });
};
