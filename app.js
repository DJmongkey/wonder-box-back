require('dotenv').config();
const express = require('express');

const connectMongoDB = require('./db');
const corsMiddleware = require('./middlewares/cors');
const HttpError = require('./controllers/httpError');
const ERRORS = require("./errorMessages");

const authRouter = require('./routes/authRoutes');

const app = express();

app.use(express.json());

connectMongoDB();

app.use(corsMiddleware);

app.use('/auth', authRouter);

app.use((req, res, next) => {
  next(new HttpError(404, ERRORS.NOT_FOUND));
});

const isDevelopment = process.env.NODE_ENV;

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = isDevelopment ? err : {};

  res.status(err.status || 500);

  if (
    !isDevelopment &&
    err.status === 500 &&
    err.message === 'Internal Server Error'
  ) {
    res.json({
      result: 'error',
      status: 500,
      message: ERRORS.INTERNAL_SERVER_ERR,
    });
  } else {
    res.json({ result: 'error', status: err.status, message: err.message });
  }
});

app.listen(3030, () => {
  console.log('Server running at http://localhost:3030');
});
