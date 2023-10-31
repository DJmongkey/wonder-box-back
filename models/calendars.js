const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'WonderBox 이름을 입력해주세요.'],
    minlength: 2,
  },
  creator: {
    type: String,
    required: [true, '보내는 사람의 이름을 입력해주세요.'],
  },
  startDate: {
    type: Date,
    required: [true, '기간을 설정해주세요.'],
  },
  endDate: {
    type: Date,
    required: [true, '기간을 설정해주세요.'],
    validate: {
      validator: function () {
        return this.startDate < this.endDate;
      },
      message: '시작일은 종료일보다 과거여야 합니다.',
    },
  },
  style: { type: mongoose.Schema.Types.ObjectId, ref: 'Style' },
  options: [
    {
      type: {
        type: String,
        enum: ['current', 'sequence', 'anytime'],
        required: true,
      },
    },
  ],
  contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DailyBox' }],
  shareUrl: {
    type: String,
  },
});

module.exports = mongoose.model('Calendar', calendarSchema);
