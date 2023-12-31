const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const HttpError = require('./httpError');
const ERRORS = require('../errorMessages');
const { createAccessToken, createRefreshToken } = require('../utils/createJwt');

const COOKIE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

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
    const refreshToken = createRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: COOKIE_EXPIRATION_MS,
    });

    return res.status(201).json({ accessToken, result: 'ok' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );

      return next(new HttpError(400, validationErrors));
    }
    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError(400, ERRORS.AUTH.NEED_ALL));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new HttpError(400, ERRORS.AUTH.WRONG_EMAIL_PW));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new HttpError(400, ERRORS.AUTH.WRONG_EMAIL_PW));
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: COOKIE_EXPIRATION_MS,
    });

    res.status(200).json({ accessToken, result: 'ok' });
  } catch (error) {
    console.error(error);

    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 0,
    });

    res.status(200).json({ result: 'ok', message: ERRORS.AUTH.LOGOUT_SUCCESS });
  } catch (error) {
    console.error(error);

    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.refresh = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new HttpError(400, ERRORS.AUTH.NEED_REFRESH_TOKEN));
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) {
        return next(new HttpError(401, ERRORS.AUTH.INVALID_REFRESH_TOKEN));
      }

      const accessToken = createAccessToken(user);

      res.status(200).json({ accessToken, result: 'ok' });
    },
  );
};
