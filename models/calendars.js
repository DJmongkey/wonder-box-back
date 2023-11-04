const mongoose = require('mongoose');

const imageUrlRegex = /^(ftp|http|https):\/\/[^ "]+\.(jpg|jpeg|png|gif)$/;
const imagePathRegex = /^.*\.(jpg|jpeg|png|gif)$/;

const boxSchema = new mongoose.Schema({
  font: {
    type: String,
    required: [true, '날짜 박스 글씨체를 지정해주세요.'],
  },
  color: {
    type: String,
    required: [true, '날짜 박스 색생을 지정해주세요.'],
  },
  bgColor: {
    type: String,
    required: [true, '날짜 박스 배경 색상을 지정해주세요.'],
  },
});

const styleSchema = new mongoose.Schema({
  titleFont: {
    type: String,
    required: [true, '제목 글씨체를 지정해주세요.'],
  },
  titleColor: {
    type: String,
    required: [true, '제목 색상을 지정해주세요.'],
  },
  borderColor: {
    type: String,
    required: [true, '제목의 테두리 색상을 지정해주세요.'],
  },
  bgImage: {
    type: String,
    required: [true, '배경 이미지를 지정해주세요.'],
    validate: {
      validator: (v) => {
        imageUrlRegex.test(v) || imagePathRegex.test(v);
      },
      message: '유효한 이미지 URL 또는 파일 경로가 아닙니다!',
    },
  },
  box: boxSchema,
});

const calendarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'WonderBox 이름을 입력해주세요.'],
    minlength: 2,
    validate: {
      validator: (v) => v.length >= 2,
      message: 'WonderBox 이름은 최소 2자 이상이어야 합니다.',
    },
  },
  creator: {
    type: String,
    required: [true, '보내는 사람의 이름을 입력해주세요.'],
  },
  createdAt: {
    type: Date,
  },
  startDate: {
    type: Date,
    required: [true, '기간을 설정해주세요.'],
  },
  endDate: {
    type: Date,
    required: [true, '기간을 설정해주세요.'],
    validate: {
      validator() {
        return this.startDate < this.endDate;
      },
      message: '시작일은 종료일보다 과거여야 합니다.',
    },
  },
  style: styleSchema,
  options: [
    {
      type: String,
      enum: ['current', 'sequence', 'anytime'],
      required: true,
    },
  ],
  dailyBoxes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DailyBox' }],
  shareUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Calendar', calendarSchema);
