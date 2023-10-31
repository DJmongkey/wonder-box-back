const jwt = require('jsonwebtoken');

const HttpError = require('./httpError');
const Calendar = require('../models/calendars');
const User = require('../models/users');
const ERRORS = require('../errorMessages');
const { getMonthDiff } = require('../utils/mothDiff');

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

exports.postBaseInfo = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const { title, creator, startDate, endDate, options } = req.body;
    const diffDay = getMonthDiff(startDate, endDate);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);

    if (!user) {
      return next(new HttpError(404, '사용자를 찾을 수 없습니다.'));
    }

    if (!(diffDay >= 2 && startDate < endDate)) {
      return next(
        new HttpError(400, '시작일은 종료일보다 과거여야 합니다(최소 2일이상)'),
      );
    }

    if (options.length < 0) {
      return next(new HttpError(400, '반드시 하나의 옵션을 선택해주세요'));
    }

    const calendar = await Calendar.create({
      title,
      creator,
      startDate,
      endDate,
      options,
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
