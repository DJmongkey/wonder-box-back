const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const HttpError = require('./httpError');
const { createAccessToken, createRefreshToken } = require('../utils/createJWT');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return next(new HttpError(400, '이미 존재하는 이메일입니다.'));
    }

    if (password !== passwordConfirm) {
      return next(new HttpError(400, '비밀번호와 일치하지 않습니다.'));
    }

    const user = await User.create({ email, password });

    const accessToken = createAccessToken(user);
    return res.status(201).json({ accessToken, result: 'ok' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (error) => error.message,
      );
      return next(new HttpError(400, validationErrors));
    } else {
      return next(error);
    }
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new HttpError(400, '이메일 주소 또는 비밀번호를 잘못 입력하셨습니다.'),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(
        new HttpError(400, '이메일 주소 또는 비밀번호를 잘못 입력하셨습니다.'),
      );
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.status(200).json({ accessToken, refreshToken, result: 'ok' });
  } catch (error) {
    console.error(error);
    return next(
      new HttpError(500, '요청하신 페이지를 처리하는 중 오류가 발생했습니다.'),
    );
  }
};

exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new HttpError(400, 'Refresh Token이 필요합니다.'));
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new HttpError(401, 'Refresh Token이 유효하지 않습니다.'));
    }

    const accessToken = createAccessToken(user);

    res.status(200).json({ accessToken, result: 'ok' });
  });
};
