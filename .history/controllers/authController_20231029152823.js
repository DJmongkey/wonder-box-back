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

    const userId = await User.create({
      email,
      password
    });
    const token = createJwtToken(userId);
    res.status(201).json({ token, result })

    return res.redirect("/calendars/base-info");
  } catch (err) {
    next(err)
  }
}

function createJwtToken(id) {
  const expires = parseInt(process.env.JWT_EXPIRES, 10);
  return jwt.sign({ id } , process.env.JWT_SECRET, {
    expiresIn: expires
  })
}
