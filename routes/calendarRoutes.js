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
} = require('../controllers/calendarController');
const { verifyToken } = require('../middlewares/auth');
const { checkFileSize } = require('../middlewares/multer');

router.post('/', verifyToken, postBaseInfo);
router.get('/:calendarId/base-info', verifyToken, getBaseInfo);
router.put('/:calendarId/base-info', verifyToken, putBaseInfo);

router.post(
  '/:calendarId/daily-boxes',
  verifyToken,
  checkFileSize,
  postDailyBoxes,
);
router.get('/:calendarId/daily-boxes', verifyToken, getAllBoxes);
router.get('/:calendarId/daily-boxes/:dailyBoxId', verifyToken, getDailyBoxes);
router.put(
  '/:calendarId/daily-boxes/:dailyBoxId',
  verifyToken,
  checkFileSize,
  putDailyBoxes,
);

router.post('/:calendarId/style', verifyToken, checkFileSize, postStyle);
router.get('/:calendarId/style', verifyToken, getStyle);
router.put('/:calendarId/style', verifyToken, checkFileSize, putStyle);

router.get('/', verifyToken, getMyWonderBox);
router.delete('/:calendarId', verifyToken, deleteMyWonderBox);

module.exports = router;
