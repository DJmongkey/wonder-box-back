const User = require("../models/users");

exports.signup = async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return res.status(400).json({ message: "이미 존재하는 이메일입니다."});
  }

  if (password !== passwordConfirm) {
    return res.status(400)
  }
}
