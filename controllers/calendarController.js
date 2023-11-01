const User = require('../models/users');
const Calendar = require('../models/calendars');
const DailyBox = require('../models/dailyBoxes');
const HttpError = require('./httpError');
const ERRORS = require('../errorMessages');
const { getMonthDiff } = require('../utils/mothDiff');

const TWO_DAYS_DIFFERENCE = 2;

exports.getBaseInfo = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
    }

    if (calendar.userId.toString() !== userId) {
      return next(new HttpError(403, ERRORS.AUTH.UNAUTHORIZED));
    }

    return res.status(200).json({ result: 'ok', calendar });
  } catch (error) {
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.postBaseInfo = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const { title, creator, startDate, endDate, options } = req.body;
    const diffDay = getMonthDiff(startDate, endDate);

    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
    }

    if (!(diffDay >= TWO_DAYS_DIFFERENCE && startDate < endDate)) {
      return next(new HttpError(400, ERRORS.CALENDAR.DURATION_ERR));
    }

    if (options.length < 0) {
      return next(new HttpError(400, ERRORS.CALENDAR.REQUIRED_OPTION));
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
      return next(new HttpError(400, ERRORS.CALENDAR.NOT_FOUND));
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
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );

      return next(new HttpError(400, validationErrors));
    }
    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.putBaseInfo = async (req, res, next) => {
  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(400, ERRORS.CALENDAR.NOT_FOUND));
    }

    const updateFields = { ...req.body };

    await Calendar.updateOne({ _id: calendar._id }, { $set: updateFields });

    return res.status(200).json({
      result: 'ok',
      message: ERRORS.CALENDAR.UPDATE_SUCCESS,
    });
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

exports.postDailyBoxes = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const { date, content, isOpen } = req.body;

    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
    }

    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
    }

    const dailyBox = await DailyBox.create({
      date,
      content,
      isOpen,
    });

    await Calendar.updateOne(
      { _id: calendar._id },
      { $addToSet: { dailyBoxes: dailyBox._id } },
    );

    return res.status(201).json({
      result: 'ok',
      dailyBoxId: dailyBox._id,
      message: ERRORS.CALENDAR.UPDATE_SUCCESS,
    });
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
