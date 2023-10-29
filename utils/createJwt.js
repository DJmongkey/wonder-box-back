const jwt = require('jsonwebtoken');

exports.createAccessToken = function(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1h',
    },
  );
};

exports.createRefreshToken = function(user) {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    },
  );
};

