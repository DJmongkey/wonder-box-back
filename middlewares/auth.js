const jwt = require('jsonwebtoken');

const HttpError = require('../controllers/httpError');
const ERRORS = require('../errorMessages');
const Calendar = require('../models/calendars');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new HttpError(401, ERRORS.AUTH.NOT_FOUND_TOKEN));
  }

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next(new HttpError(401, ERRORS.AUTH.INVALID_ACCESS_TOKEN));
    }

    req.user = user;
    return next();
  });
};

exports.checkCalendarAuthorization = async (req, res, next) => {
  const { userId } = req.user;

  const { calendarId } = req.params;
  const calendar = await Calendar.findById(calendarId).lean();

  if (!calendar) {
    return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
  }

  if (calendar.userId.toString() !== userId) {
    return next(new HttpError(403, ERRORS.AUTH.UNAUTHORIZED));
  }

  req.calendarId = calendarId;
  req.calendar = calendar;
  req.userId = userId;

  next();
};
