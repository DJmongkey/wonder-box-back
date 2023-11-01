const express = require('express');
const {
  getBaseInfo,
  postBaseInfo,
  putBaseInfo,
} = require('../controllers/calendarController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/:calendarId/base-info', getBaseInfo);

router.post('/', postBaseInfo);

router.put('/:calendarId/base-info', verifyToken, putBaseInfo);

module.exports = router;
