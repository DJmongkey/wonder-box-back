const jwt = require('jsonwebtoken');

const Calendar = require('../models/calendars');
const User = require('../models/users');
const HttpError = require('./httpError');
const ERRORS = require('../errorMessages');
const { getMonthDiff } = require('../utils/mothDiff');

exports.getBaseInfo = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next(new HttpError(401, ERRORS.AUTH.NOT_FOUND_TOKEN));
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  const userId = decoded.userId;

  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND_BASE_INFO));
    }

    if (calendar.userId.toString() !== userId) {
      return next(new HttpError(403, ERRORS.AUTH.UNAUTHORIZED));
    }

    res.status(200).json({ result: 'ok', calendar });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.postBaseInfo = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return next(new HttpError(401, ERRORS.AUTH.NOT_FOUND_TOKEN));
  }

  try {
    const { title, creator, startDate, endDate, options } = req.body;
    const diffDay = getMonthDiff(startDate, endDate);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
    }

    if (!(diffDay >= 2 && startDate < endDate)) {
      return next(new HttpError(400, ERRORS.CALENDAR.DURATION_ERR));
    }

    if (options.length < 0) {
      return next(new HttpError(400, ERRORS.CALENDAR.NEED_OPTION));
    }

    const calendar = await Calendar.create({
      title,
      creator,
      startDate,
      endDate,
      options,
      userId,
    });

    if (!calendar) {
      return next(new HttpError(400, ERRORS.CALENDAR.NOT_FOUND_BASE_INFO));
    }

    await User.updateOne(
      { _id: userId },
      { $addToSet: { calendars: calendar._id } },
    );

    return res.status(201).json({
      result: 'ok',
      calendarId: calendar._id,
      message: ERRORS.CALENDAR.POST_SUCCESS,
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};
