const express = require('express');

const router = express.Router();

const {
  getBaseInfo,
  postBaseInfo,
  putBaseInfo,
  postDailyBoxes,
  getDailyBoxes,
  getAllBoxes,
  putDailyBoxes,
  getMyWonderBox,
  deleteMyWonderBox,
  postStyle,
  getStyle,
  putStyle,
  getSharingLink,
} = require('../controllers/calendarController');
const {
  verifyToken,
  checkCalendarAuthorization,
} = require('../middlewares/auth');
const { checkFileSize } = require('../middlewares/multer');

router.post('/', verifyToken, postBaseInfo);
router.get(
  '/:calendarId/base-info',
  verifyToken,
  checkCalendarAuthorization,
  getBaseInfo,
);
router.put(
  '/:calendarId/base-info',
  verifyToken,
  checkCalendarAuthorization,
  putBaseInfo,
);

router.post(
  '/:calendarId/daily-boxes',
  verifyToken,
  checkFileSize,
  checkCalendarAuthorization,
  postDailyBoxes,
);
router.get(
  '/:calendarId/daily-boxes',
  verifyToken,
  checkCalendarAuthorization,
  getAllBoxes,
);
router.get(
  '/:calendarId/daily-boxes/:dailyBoxId',
  verifyToken,
  checkCalendarAuthorization,
  getDailyBoxes,
);
router.put(
  '/:calendarId/daily-boxes/:dailyBoxId',
  verifyToken,
  checkCalendarAuthorization,
  checkFileSize,
  putDailyBoxes,
);

router.post(
  '/:calendarId/style',
  verifyToken,
  checkCalendarAuthorization,
  checkFileSize,
  postStyle,
);
router.get(
  '/:calendarId/style',
  verifyToken,
  checkCalendarAuthorization,
  getStyle,
);
router.put(
  '/:calendarId/style',
  verifyToken,
  checkCalendarAuthorization,
  checkFileSize,
  putStyle,
);

router.get('/', verifyToken, getMyWonderBox);
router.delete(
  '/:calendarId',
  verifyToken,
  checkCalendarAuthorization,
  deleteMyWonderBox,
);

router.get('/:calendarId/share', getSharingLink);

module.exports = router;
