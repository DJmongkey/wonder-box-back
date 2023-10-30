const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const HttpError = require('./controllers/httpError');

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

    const user = await User.create({
      email,
      password
    });
    const token = createJwtToken(user);
    res.status(201).json({ token, result : "ok" })

    return res.status(303).redirect("/calendars/base-info");
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ result: "error", message: validationErrors });
    } else {
      return next(new HttpError(500, ERRORS.PROCESS_ERR));
    }
  }
}

function createJwtToken(user) {
  return jwt.sign({ email: user.email } , process.env.JWT_SECRET, {
    expiresIn: "1h"
  })
}
