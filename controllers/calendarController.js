const User = require('../models/users');
const Calendar = require('../models/calendars');
const DailyBox = require('../models/dailyBoxes');
const { uploadFiles, deleteFileFromS3 } = require('../middlewares/multer');
const { getMonthDiff } = require('../utils/date');
const { handleErrors } = require('../utils/errorHandlers');
const HttpError = require('./httpError');
const ERRORS = require('../errorMessages');

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
        calendarId: calendar._id,
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
    try {
      const { dailyBoxId } = req.body;
      const updatedContent = req.body.content || {};

      const { files } = req;

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
        dailyBoxId,
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
      });
    } catch (error) {
      console.error(error);
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

          updatedContent[type] = file?.location;

          if (oldUrl?.startsWith(process.env.S3_BASE_URL)) {
            deleteFileFromS3(oldUrl);
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
          sharedUrl: calendar.sharedUrl,
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

    const dailyBoxes = await DailyBox.find({ calendarId }).lean();

    const deleteAll = dailyBoxes.map((box) => {
      const deleteImage = deleteFileFromS3(box.content.image);
      const deleteVideo = deleteFileFromS3(box.content.video);
      const deleteAudio = deleteFileFromS3(box.content.audio);

      return Promise.all([deleteImage, deleteVideo, deleteAudio]);
    });

    await Promise.all(deleteAll);

    await DailyBox.deleteMany({ calendarId });

    await Calendar.findByIdAndDelete(calendarId);

    await User.updateOne({ _id: userId }, { $pull: { calendars: calendarId } });

    return res
      .status(200)
      .json({ result: 'ok', message: ERRORS.CALENDAR.DELETE_SUCCESS });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.CALENDAR.FAILED_DELETE));
  }
};

exports.postStyle = async (req, res, next) => {
  try {
    const { calendarId, file } = req;

    uploadFiles.single('image')(req, res, async (error) => {
      if (error) {
        return next(new HttpError(500, ERRORS.CALENDAR.FAILED_UPLOAD));
      }

      const {
        titleFont,
        titleColor,
        borderColor,
        backgroundColor,
        image,
        box,
      } = req.body;

      const style = {
        titleFont,
        titleColor,
        borderColor,
        backgroundColor,
        image: file?.location || image,
        box,
      };

      if (!style) {
        return next(new HttpError(400, ERRORS.CALENDAR.FAILED_STYLE));
      }

      const sharedUrl = generateSharingLink(calendarId);

      if (!sharedUrl) {
        return next(new HttpError(400, ERRORS.CALENDAR.FAILED_CREATE_LINK));
      }

      await Calendar.updateOne(
        { _id: calendarId },
        { $set: { style, createdAt: new Date(), sharedUrl } },
      );

      return res.status(200).json({
        result: 'ok',
        calendars: calendarId,
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
        sharedUrl,
      });
    });
  } catch (error) {
    console.error(error);
    handleErrors(error, next);
  }
};

exports.getStyle = async (req, res, next) => {
  try {
    const { style = {} } = req.calendar;

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

      const uploadedFile = req.file?.location;
      const oldUrl = calendar.style.image;

      if (oldUrl?.startsWith(process.env.S3_BASE_URL)) {
        deleteFileFromS3(oldUrl);
      }

      const updateStyles = { ...req.body };

      if (uploadedFile) {
        updateStyles.image = uploadedFile;
      }

      const { sharedUrl } = calendar;

      await Calendar.updateOne(
        { _id: calendarId },
        { $set: { style: updateStyles } },
      );

      return res.status(200).json({
        result: 'ok',
        message: ERRORS.CALENDAR.UPDATE_SUCCESS,
        sharedUrl,
      });
    });
  } catch (error) {
    console.error(error);
    handleErrors(error, next);
  }
};

exports.getSharingLink = async (req, res, next) => {
  try {
    const { calendarId } = req.params;
    const calendar = await Calendar.findById(calendarId).populate('dailyBoxes');

    if (!calendar) {
      return next(new HttpError(404, ERRORS.CALENDAR.NOT_FOUND));
    }

    const { dailyBoxes, style } = calendar;
    if (!dailyBoxes) {
      return next(new HttpError(404, ERRORS.CALENDAR.CONTENTS_NOT_FOUND));
    }

    if (!style) {
      return next(new HttpError(404, ERRORS.CALENDAR.STYLE_NOT_FOUND));
    }

    return res.status(200).json({ result: 'ok', calendar, dailyBoxes, style });
  } catch (error) {
    console.error(error);
    return next(new HttpError(500, ERRORS.INTERNAL_SERVER_ERR));
  }
};

function generateSharingLink(calendarId) {
  return `${process.env.LOCAL_ORIGIN}/calendars/${calendarId}/share`;
}
