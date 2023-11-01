const express = require('express');
const {
  getBaseInfo,
  postBaseInfo,
  putBaseInfo,
  postDailyBoxes,
} = require('../controllers/calendarController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/:calendarId/base-info', verifyToken, getBaseInfo);

router.post('/', verifyToken, postBaseInfo);

router.put('/:calendarId/base-info', verifyToken, putBaseInfo);

router.post('/:calendarId/daily-boxes', verifyToken, postDailyBoxes);

module.exports = router;
