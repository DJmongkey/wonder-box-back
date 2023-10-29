const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/authController");
const { isAuth } = require("../middlewares/auth")

router.post("/signup", isAuth,signup);

module.exports =router
