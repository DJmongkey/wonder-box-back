const express = require('express');
const {
  getBaseInfo,
  postBaseInfo,
  putBaseInfo,
  postDailyBoxes,
  getDailyBoxes,
  getAllBoxes,
} = require('../controllers/calendarController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/', verifyToken, postBaseInfo);
router.get('/:calendarId/base-info', verifyToken, getBaseInfo);
router.put('/:calendarId/base-info', verifyToken, putBaseInfo);

router.post('/:calendarId/daily-boxes', verifyToken, postDailyBoxes);
router.get('/:calendarId/daily-boxes', verifyToken, getAllBoxes);
router.get('/:calendarId/daily-boxes/:dailyBoxId', verifyToken, getDailyBoxes);

module.exports = router;
