const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * JWT Token Doğrulama Middleware
 * Authorization header'ından token'ı alır ve doğrular
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization header'ından token'ı al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Token yoksa hata fırlat
  if (!token) {
    return next(new AppError('Bu işlem için giriş yapmanız gerekiyor', 401));
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanından al (şifre hariç)
    const user = await User.findById(decoded.id).select('-sifre');

    if (!user) {
      return next(new AppError('Bu token\'a ait kullanıcı bulunamadı', 401));
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.aktif) {
      return next(new AppError('Hesabınız pasif durumda', 403));
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Geçersiz token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token süresi dolmuş. Lütfen tekrar giriş yapın', 401));
    }
    return next(new AppError('Token doğrulama hatası', 401));
  }
});

/**
 * Admin Yetkisi Kontrol Middleware
 * Kullanıcının admin olup olmadığını kontrol eder
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Kullanıcının rolü izin verilen roller arasında mı?
    if (!roles.includes(req.user.rol)) {
      return next(
        new AppError('Bu işlem için yetkiniz yok', 403)
      );
    }
    next();
  };
};

/**
 * Admin kontrolü için kısayol
 */
const adminOnly = restrictTo('admin');

module.exports = {
  protect,
  restrictTo,
  adminOnly
};
