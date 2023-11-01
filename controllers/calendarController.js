const jwt = require('jsonwebtoken');

const HttpError = require('./httpError');
const Calendar = require('../models/calendars');
const User = require('../models/users');
const ERRORS = require('../errorMessages');
const { getMonthDiff } = require('../utils/mothDiff');

const TWO_DAYS_DIFFERENCE = 2;

exports.getBaseInfo = async (req, res, next) => {
  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND_BASE_INFO));
    }
    return res.status(200).json({ result: 'ok' });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.postBaseInfo = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const { title, creator, startDate, endDate, options } = req.body;
    const diffDay = getMonthDiff(startDate, endDate);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const { userId } = decoded;

    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.NOT_FOUND_USER));
    }

    if (!(diffDay >= TWO_DAYS_DIFFERENCE && startDate < endDate)) {
      return next(
        new HttpError(400, ERRORS.CALENDAR.START_DATE_MUST_BE_BEFORE_END_DATE),
      );
    }

    if (options.length < 0) {
      return next(new HttpError(400, ERRORS.CALENDAR.ONE_OPTION_REQUIRED));
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
      message: '새로운 캘린더에 기본정보가 저장 되었습니다.',
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.putBaseInfo = async (req, res, next) => {
  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(400, ERRORS.CALENDAR.NOT_FOUND_BASE_INFO));
    }

    const updateFields = { ...req.body };

    await Calendar.updateOne({ _id: calendar._id }, { $set: updateFields });

    return res.status(200).json({
      result: 'ok',
      message: '캘린더 기본정보 업데이트에 성공했습니다.',
    });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};
