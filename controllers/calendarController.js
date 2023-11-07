const User = require('../models/users');
const Calendar = require('../models/calendars');
const DailyBox = require('../models/dailyBoxes');
const HttpError = require('./httpError');
const ERRORS = require('../errorMessages');
const { uploadFiles, deleteFileFromS3 } = require('../middlewares/multer');
const { getMonthDiff } = require('../utils/mothDiff');
const { handleErrors } = require('../utils/errorHandlers');

const TWO_DAYS_DIFFERENCE = 2;

exports.getBaseInfo = async (req, res, next) => {
  try {
    const { calendar } = req;

    res.status(200).json({ result: 'ok', calendar });
  } catch (error) {
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.postBaseInfo = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const { title, creator, startDate, endDate, options } = req.body;

    const diffDay = getMonthDiff(startDate, endDate);

    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
    }

    if (!(diffDay >= TWO_DAYS_DIFFERENCE && startDate < endDate)) {
      return next(new HttpError(400, ERRORS.CALENDAR.DURATION_ERR));
    }

    if (options.length < 0) {
      return next(new HttpError(400, ERRORS.CALENDAR.REQUIRED_OPTION));
    }

    const calendar = await Calendar.create({
      title,
      creator,
      startDate,
      endDate,
      options,
      userId,
    });

    if (!calendar) {
      return next(new HttpError(400, ERRORS.CALENDAR.NOT_FOUND));
    }

    const dailyBoxes = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dailyBox = await DailyBox.create({
        date: currentDate,
        content: {},
        isOpen: true,
      });

      if (dailyBox) {
        dailyBoxes.push(dailyBox._id);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    calendar.dailyBoxes = dailyBoxes;

    await calendar.save();

    await User.updateOne(
      { _id: userId },
      { $addToSet: { calendars: calendar._id } },
    );

    return res.status(201).json({
      result: 'ok',
      calendarId: calendar._id,
      message: ERRORS.CALENDAR.POST_SUCCESS,
    });
  } catch (error) {
    handleErrors(error, next);
  }
};

exports.putBaseInfo = async (req, res, next) => {
  try {
    const { calendarId } = req;

    const updateFields = { ...req.body };

    await Calendar.updateOne({ _id: calendarId }, { $set: updateFields });

    return res.status(200).json({
      result: 'ok',
      message: ERRORS.CALENDAR.UPDATE_SUCCESS,
    });
  } catch (error) {
    handleErrors(error, next);
  }
};

exports.postDailyBoxes = [
  uploadFiles.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res, next) => {
    const { calendarId, userId } = req;

    try {
      const { dailyBoxId } = req.body;
      const updatedContent = req.body.content || {};

      const { files } = req;

      const user = await User.findById(userId).lean();

      if (!user) {
        return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
      }

      const calendar = await Calendar.findById(req.params.calendarId).lean();

      if (!calendar) {
        return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
      }

      const dailyBox = await DailyBox.findById(dailyBoxId).lean();

      if (!dailyBox) {
        return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
      }

      if (dailyBox._id.toString() !== dailyBoxId) {
        return next(new HttpError(404, ERRORS.AUTH.UNAUTHORIZED));
      }
      
      const fileUploadAll = ['image', 'video', 'audio'].map(async (type) => {
        if (files[type]) {
          updatedContent[type] = files[type][0].location;
        }
      });

      await Promise.all(fileUploadAll);

      await DailyBox.updateOne(
        { _id: dailyBoxId },
        { $set: { content: { ...dailyBox.content, ...updatedContent } } },
      );

      return res.status(201).json({
        result: 'ok',
        dailyBoxId: dailyBox._id,
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
      });
    } catch (error) {
      console.log(error);
      handleErrors(error, next);
    }
  },
];

exports.getAllBoxes = async (req, res, next) => {
  const { calendarId } = req;

  try {
    const calendar = await Calendar.findById(calendarId).populate('dailyBoxes');

    const { dailyBoxes } = calendar;

    if (!dailyBoxes) {
      return next(new HttpError(404, ERRORS.CALENDAR.CONTENTS_NOT_FOUND));
    }

    return res.status(200).json({ result: 'ok', dailyBoxes });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.getDailyBoxes = async (req, res, next) => {
  try {
    const dailyBox = await DailyBox.findById(req.params.dailyBoxId).lean();

    if (!dailyBox) {
      return next(new HttpError(404, ERRORS.CALENDAR.CONTENTS_NOT_FOUND));
    }

    return res.status(200).json({ result: 'ok', dailyBox });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.putDailyBoxes = [
  uploadFiles.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const updatedContent = req.body.content || {};
      const { files } = req;

      const dailyBox = await DailyBox.findById(req.params.dailyBoxId).lean();

      if (!dailyBox) {
        return next(new HttpError(404, ERRORS.CALENDAR.CONTENTS_NOT_FOUND));
      }

      const fileUpdateAll = ['image', 'video', 'audio'].map(async (type) => {
        if (files[type]) {
          const file = files[type][0];
          const oldUrl = dailyBox.content[type];

          updatedContent[type] = file.location;

          if (oldUrl) {
            const oldKey = oldUrl.split('/').pop();
            const decodedKey = decodeURIComponent(oldKey);

            await deleteFileFromS3(`image/${decodedKey}`);
          }
        }
      });

      await Promise.all(fileUpdateAll);

      await DailyBox.updateOne(
        { _id: dailyBox._id },
        { $set: { content: { ...dailyBox.content, ...updatedContent } } },
      );

      return res.status(200).json({
        result: 'ok',
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
      });
    } catch (error) {
      handleErrors(error, next);
    }
  },
];

exports.getMyWonderBox = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return next(new HttpError(404, ERRORS.AUTH.USER_NOT_FOUND));
    }

    const calendars = await Promise.all(
      user.calendars.map(async (calendarId) => {
        const calendar = await Calendar.findById(calendarId).lean();

        if (!calendar) {
          return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
        }

        return {
          calendarId: calendar._id,
          title: calendar.title,
          creator: calendar.creator,
          createdAt: calendar.createdAt,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          shareUrl: calendar.shareUrl,
        };
      }),
    );

    return res.status(200).json({ result: 'ok', calendars });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.deleteMyWonderBox = async (req, res, next) => {
  try {
    const { calendarId, userId } = req;

    await Calendar.findByIdAndDelete(calendarId);

    await User.updateOne({ _id: userId }, { $pull: { calendars: calendarId } });

    return res
      .status(200)
      .json({ result: 'ok', message: ERRORS.CALENDAR.DELETE_SUCCESS });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.PROCESS_ERR));
  }
};

exports.postStyle = async (req, res, next) => {
  try {
    const { calendarId } = req;

    uploadFiles.single('image')(req, res, async (error) => {
      if (error) {
        return next(new HttpError(500, ERRORS.CALENDAR.FAILED_UPLOAD));
      }

      const { titleFont, titleColor, borderColor, backgroundColor } = req.body;

      const boxStyle = req.body.box || {};

      const image = req.file.location;

      const styleData = {
        titleFont,
        titleColor,
        backgroundColor,
        borderColor,
        image,
        box: boxStyle,
      };

      if (!styleData) {
        return next(new HttpError(400, ERRORS.CALENDAR.FAILED_STYLE));
      }

      const shareUrl = generateShareLink(calendarId);

      if (!shareUrl) {
        return next(new HttpError(400, ERRORS.CALENDAR.FAILED_SHARE_LINK));
      }

      await Calendar.updateOne(
        { _id: calendarId },
        {
          $addToSet: { style: styleData },
          $set: { createdAt: new Date(), shareUrl },
        },
      );

      return res.status(200).json({
        result: 'ok',
        calendars: calendarId,
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
        shareUrl,
      });
    });
  } catch (error) {
    console.log(error);
    handleErrors(error, next);
  }
};

exports.getStyle = async (req, res, next) => {
  try {
    const { calendar } = req;
    const { style } = calendar;

    if (!style) {
      return next(new HttpError(404, ERRORS.CALENDAR.STYLE_NOT_FOUND));
    }

    return res.status(200).json({ result: 'ok', style });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

exports.putStyle = async (req, res, next) => {
  try {
    const { calendarId, calendar } = req;

    uploadFiles.single('image')(req, res, async (error) => {
      if (error) {
        return next(new HttpError(500, ERRORS.CALENDAR.FAILED_UPLOAD));
      }
      const isImageUploaded = req.file && req.file.location;

      const oldUrl = calendar.style.image || calendar.style[0].image;

      const updateImage = isImageUploaded ? req.file.location : oldUrl;

      if (oldUrl !== updateImage) {
        const oldKey = oldUrl.split('/').pop();
        const decodedKey = decodeURIComponent(oldKey);

        await deleteFileFromS3(`image/${decodedKey}`);
      }

      const updateStyles = { ...req.body };

      const boxStyle = req.body.box || {};

      const updatedStyle = {
        titleFont: updateStyles.titleFont,
        titleColor: updateStyles.titleColor,
        backgroundColor: updateStyles.backgroundColor,
        borderColor: updateStyles.borderColor,
        image: updateImage,
        box: boxStyle,
      };

      const { shareUrl } = calendar;

      await Calendar.updateOne(
        { _id: calendarId },
        { $set: { style: updatedStyle } },
      );

      return res.status(200).json({
        result: 'ok',
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
        shareUrl,
      });
    });
  } catch (error) {
    console.error(error);
    handleErrors(error, next);
  }
};

function generateShareLink(calendarId) {
  return `https://mywonder.com/calendars/${calendarId}/share`;
}
