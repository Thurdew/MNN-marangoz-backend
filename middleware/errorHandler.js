const AppError = require('../utils/AppError');

/**
 * Mongoose Validation Error'ları için handler
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Geçersiz veri girişi: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Mongoose Duplicate Key Error için handler
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const message = `Bu ${field} zaten kullanımda`;
  return new AppError(message, 400);
};

/**
 * Mongoose Cast Error için handler (geçersiz ObjectId)
 */
const handleCastError = (err) => {
  const message = `Geçersiz ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Development ortamı için detaylı hata response
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Production ortamı için temiz hata response
 */
const sendErrorProd = (err, res) => {
  // Operasyonel hatalar: kullanıcıya güvenle gösterilebilir
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  // Programlama hataları: detayları kullanıcıya gösterme
  else {
    console.error('❌ HATA:', err);

    res.status(500).json({
      success: false,
      message: 'Bir şeyler yanlış gitti'
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
      error = handleDuplicateKeyError(err);
    }

    // Mongoose Cast Error
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route bulunamadı: ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
