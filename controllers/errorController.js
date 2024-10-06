const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path} ${err.value}`, 400);
};
const handleDuplacteFieldDB = (err) => {
  const { name } = err.keyValue;
  return new AppError(
    `Duplicate field value : / ${name} / please use anothe value`,
    400
  );
};
const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Validation Error : /${message.join('. ')}/`);
};
const handleJWTerror = () =>
  new AppError(`Invalid Signature please login again`, 401);
const handleTokenExpiredError = () =>
  new AppError(`Your token expired please login and continue`, 401);

// IN DEVELOPMENT
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
};

// IN PRODUCTION
const sendErrorProd = (err,req, res) => {
  if (req.originalUrl.startsWith('/api')) {

    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log('ERROR', err);
    return res.status(500).json({
      status: 'Error',
      message: 'Something went wrong',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message=err.message
    //handle cast error : ex-> invalid id send , Object id failure
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    //handle duplicateField error ex->This error coming from mongoDB driver when sending same field name again
    if (err.code === 11000) error = handleDuplacteFieldDB(error);
    //handle validation Error
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    
    //handle jwttokenerror
    if (err.name === 'JsonWebTokenError') error = handleJWTerror();
    //handle TokenExpiredError
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, req, res);
  }
};
