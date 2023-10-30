const express = require('express');
const {
  getBaseInfo,
  postBaseInfo,
} = require('../controllers/calendarController');
const router = express.Router();

router.get('/:calendarId/base-info', getBaseInfo);

router.post('/', postBaseInfo);

module.exports = router;
