const HttpError = require('./httpError');
const Calendar = require('../models/calendars');
const ERRORS = require('../errorMessages');

exports.getBaseInfo = async (req, res, next) => {
  try {
    const calendar = await Calendar.findById(req.params.calendarId).lean();

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND_BASE_INFO));
    }

    if (calendar) {
      return res.status(200).json({ result: 'ok' });
    }
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};
