const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/responseHelper');

/**
 * JWT Token Oluştur
 * @param {String} id - Kullanıcı ID
 * @returns {String} - JWT Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Token ile birlikte response gönder
 */
const sendTokenResponse = (user, statusCode, message, res) => {
  const token = signToken(user._id);

  const userData = {
    id: user._id,
    kullaniciAdi: user.kullaniciAdi,
    rol: user.rol,
    adSoyad: user.adSoyad,
    email: user.email,
    telefon: user.telefon,
    aktif: user.aktif
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Yeni kullanıcı kaydı
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { kullaniciAdi, sifre, adSoyad, email, telefon } = req.body;

  // Kullanıcı adı veya email zaten var mı kontrol et
  const existingUser = await User.findOne({
    $or: [{ kullaniciAdi: kullaniciAdi.toLowerCase() }, { email: email.toLowerCase() }]
  });

  if (existingUser) {
    if (existingUser.kullaniciAdi === kullaniciAdi.toLowerCase()) {
      return next(new AppError('Bu kullanıcı adı zaten kullanımda', 400));
    }
    if (existingUser.email === email.toLowerCase()) {
      return next(new AppError('Bu e-posta adresi zaten kullanımda', 400));
    }
  }

  // Yeni kullanıcı oluştur
  const user = await User.create({
    kullaniciAdi,
    sifre,
    adSoyad,
    email,
    telefon,
    rol: 'musteri' // Varsayılan rol
  });

  // Token ile response gönder
  sendTokenResponse(user, 201, 'Kayıt başarılı', res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { kullaniciAdi, sifre } = req.body;

  // Kullanıcıyı bul (şifre ile birlikte)
  const user = await User.findOne({ kullaniciAdi: kullaniciAdi.toLowerCase() }).select('+sifre');

  if (!user) {
    return next(new AppError('Kullanıcı adı veya şifre hatalı', 401));
  }

  // Şifre kontrolü
  const isPasswordCorrect = await user.comparePassword(sifre);

  if (!isPasswordCorrect) {
    return next(new AppError('Kullanıcı adı veya şifre hatalı', 401));
  }

  // Kullanıcı aktif mi kontrol et
  if (!user.aktif) {
    return next(new AppError('Hesabınız pasif durumda. Lütfen yönetici ile iletişime geçin', 403));
  }

  // Token ile response gönder
  sendTokenResponse(user, 200, 'Giriş başarılı', res);
});

/**
 * @route   GET /api/auth/me
 * @desc    Mevcut kullanıcı bilgilerini getir
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user zaten auth middleware'den geliyor
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  successResponse(res, 200, 'Kullanıcı bilgileri getirildi', user);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı (Client-side token silme)
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
  // JWT ile çalışırken logout client-side'da yapılır
  // Token silinir veya blacklist'e eklenir
  successResponse(res, 200, 'Çıkış başarılı', null);
});
