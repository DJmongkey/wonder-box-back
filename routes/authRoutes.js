const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  refresh,
  logout,
} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);

module.exports = router;
