const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

const User = require("../models/users");
const ERRORS = require("../errorMessages");

exports.signup = async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({ message: ERRORS.AUTH.EXISTING_EMAIL});
    };

    if (password !== passwordConfirm) {
      return res.status(400).json({ message : ERRORS.AUTH.UNMATCHED_PW});
    };

    const userId = await User.create({
      email,
      password
    });
    const token = createJwtToken(userId);
    res.status(201).json({ token, result : "ok" })

    return res.redirect("/calendars/base-info");
  } catch (err) {
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ result: "fail", message: validationErrors });
    } else {
      return next(new HttpError(500, ERRORS.PROCESS_ERR));
    }
  }
}

function createJwtToken(id) {
  const expires = parseInt(process.env.JWT_EXPIRES, 10);
  return jwt.sign({ id } , process.env.JWT_SECRET, {
    expiresIn: expires
  })
}
