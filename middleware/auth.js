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

  console.log('🔐 Auth middleware - Token doğrulaması başlatılıyor...');
  console.log('📋 Authorization header:', req.headers.authorization ? 'Mevcut' : 'Yok');

  // Authorization header'ından token'ı al
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Bearer token bulundu (ilk 20 karakter):', token.substring(0, 20) + '...');
  }

  // Token yoksa hata fırlat
  if (!token) {
    console.log('❌ Token bulunamadı');
    return next(new AppError('Bu işlem için giriş yapmanız gerekiyor', 401));
  }

  try {
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token doğrulandı, User ID:', decoded.id);

    // Kullanıcıyı veritabanından al (şifre hariç)
    const user = await User.findById(decoded.id).select('-sifre');

    if (!user) {
      console.log('❌ Token geçerli ama kullanıcı bulunamadı');
      return next(new AppError('Bu token\'a ait kullanıcı bulunamadı', 401));
    }

    console.log('✅ Kullanıcı bulundu:', user.email, '| Rol:', user.rol);

    // Kullanıcı aktif mi kontrol et
    if (!user.aktif) {
      console.log('❌ Kullanıcı hesabı pasif');
      return next(new AppError('Hesabınız pasif durumda', 403));
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    console.log('✅ Auth başarılı, işlem devam ediyor...');
    next();
  } catch (error) {
    console.log('❌ Token doğrulama hatası:', error.message);
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
    console.log('🔒 Yetki kontrolü - İzin verilen roller:', roles);
    console.log('👤 Kullanıcı rolü:', req.user?.rol);

    // Kullanıcının rolü izin verilen roller arasında mı?
    if (!roles.includes(req.user.rol)) {
      console.log('❌ Yetki yetersiz - Erişim reddedildi');
      return next(
        new AppError('Bu işlem için yetkiniz yok', 403)
      );
    }

    console.log('✅ Yetki kontrolü başarılı');
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
