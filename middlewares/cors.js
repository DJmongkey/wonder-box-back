module.exports = (req, res, next) => {
  const allowedOrigins = [
    `${
      process.env.NODE_ENV === 'development'
        ? process.env.LOCAL_ORIGIN
        : process.env.PRODUCT_ORIGIN
    }`,
  ];

  const { origin } = req.headers;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
};
