const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const HttpError = require('./httpError');
const ERRORS = require("../errorMessages");
const { createAccessToken, createRefreshToken } = require('../utils/createJWT');

exports.signup = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return next(new HttpError(400, ERRORS.AUTH.EXISTING_EMAIL));
    }

    if (password !== passwordConfirm) {
      return next(new HttpError(400, ERRORS.AUTH.UNMATCHED_PW));
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
      return next(new HttpError(500, ERRORS.PROCESS_ERR));
    }
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError(400, '이메일과 비밀번호는 필수입니다.'));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new HttpError(400, '이메일 또는 비밀번호를 잘못 입력하셨습니다.'),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(
        new HttpError(400, '이메일 또는 비밀번호를 잘못 입력하셨습니다.'),
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
