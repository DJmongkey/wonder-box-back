const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

const User = require("../models/users");

exports.signup = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({ message: "이미 존재하는 이메일입니다."});
    };

    if (password !== passwordConfirm) {
      return res.status(400).json({ message : "비밀번호와 일치하지 않습니다."});
    };

    const user = await User.create({
      email,
      password
    });
    const token = createJwtToken(user);
    res.status(201).json({ token, result : "ok" })

    return res.status(303).redirect("/calendars/base-info");
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((error) => error.message);
      return res.status(400).json({ result: "error", message: validationErrors });
    } else {
      return next(error);
    }
  }
}

function createJwtToken(user) {
  return jwt.sign({ email: user.email } , process.env.JWT_SECRET, {
    expiresIn: "1h"
  })
}
