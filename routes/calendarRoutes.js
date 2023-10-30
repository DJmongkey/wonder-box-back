const express = require('express');
const { getBaseInfo } = require('../controllers/calendarController');
const router = express.Router();

router.get('/:calendarId/base-info', getBaseInfo);

module.exports = router;
