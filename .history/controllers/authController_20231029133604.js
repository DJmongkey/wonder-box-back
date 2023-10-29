const User = require("../models/users");

exports.signup = async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    return res.status(400)
  }
}
