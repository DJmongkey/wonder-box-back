const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*[\d])(?=.*[!@#$%^&*()-_=+₩~\{\}\[\]\|\:\;\"\'\<\>\,.\?\/]).+$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요.'],
    unique: true,
    validate: {
      validator: (v) => emailRegex.test(v),
      message: '올바르지 않은 이메일 주소입니다.',
    },
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요.'],
    minlength: 8,
    maxlength: 16,
    validate: {
      validator: (v) => passwordRegex.test(v),
      message:
        '비밀번호는 8~16자의 영문 대/소문자, 숫자, 특수문자가 포함되어야 합니다.',
    },
  },
  calendars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Calendar' }],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(11);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

module.exports = mongoose.model('User', userSchema);
