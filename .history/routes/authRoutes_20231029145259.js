const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/authController");
const { isAuth } = require("../middlewares/auth")

router.post("/signup", signup);

module.exports =router
