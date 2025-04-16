import appError from '../utils/appError.js';


const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJWTError = () => new appError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () => new appError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;

// export const errorHandler = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   } else if (process.env.NODE_ENV === 'production') {
//     let error = { ...err };
//     if (!error.message) error.message = err.message;
    
//     // Handle specific error types
//     if (err.name === 'CastError') {
//       const message = `Resource not found with id of ${err.value}`;
//       error = new appError(message, 404);
//     }
    
//     if (err.code === 11000) {
//       const message = 'Duplicate field value entered';
//       error = new appError(message, 400);
//     }
    
//     if (err.name === 'ValidationError') {
//       const message = Object.values(err.errors)
//         .map((val) => val.message)
//         .join('. ');
//       error = new appError(message, 400);
//     }
    
//     if (err.name === 'MongooseError') {
//       error = new appError(err.message, 409);
//     }
    
//     res.status(error.statusCode).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };