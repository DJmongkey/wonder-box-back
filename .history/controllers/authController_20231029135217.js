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

    const hashed = await bcrypt.hash(password, 11);

    const userId = await User.create({
      email,
      password: hashed,
    });
    const token = createJwtToken(userId);

    return res.redirect("/calendars/:calendarId/base-info");
  } catch (err) {

  }
}

function createJwtToken(id) {
  return jwt.sign({ id } , process.env.JWT_SECRET)
}
