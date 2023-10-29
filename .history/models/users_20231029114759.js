const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*[\d])(?=.*[!@#$%^&*()-_=+₩~\{\}\[\]\|\:\;\"\'\<\>\,.\?\/]).+$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "이메일을 입력해주세요."],
    unique: true,
    validate: {
      validator: (value) => emailRegex.test(value),
      message: "올바르지 않은 이메일 주소입니다."
    }
  },
  password: {
    type: String,
    required: [true, "비밀번호를 입력해주세요." ]
  }
})
