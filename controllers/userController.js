const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, getPagination, paginationResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/users/profile
 * @desc    Kullanıcı profilini getir
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  successResponse(res, 200, 'Profil bilgileri getirildi', user);
});

/**
 * @route   PUT /api/users/profile
 * @desc    Kullanıcı profilini güncelle
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Güncellenebilir alanlar
  const allowedUpdates = ['adSoyad', 'email', 'telefon'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Eğer email güncelleniyorsa, başka kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return next(new AppError('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor', 400));
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });

  successResponse(res, 200, 'Profil başarıyla güncellendi', user);
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Şifre değiştir
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { eskiSifre, yeniSifre } = req.body;

  // Kullanıcıyı şifre ile birlikte getir
  const user = await User.findById(req.user.id).select('+sifre');

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  // Eski şifre doğru mu?
  const isPasswordCorrect = await user.comparePassword(eskiSifre);

  if (!isPasswordCorrect) {
    return next(new AppError('Eski şifre hatalı', 401));
  }

  // Yeni şifreyi kaydet (pre-save hook otomatik hash'leyecek)
  user.sifre = yeniSifre;
  await user.save();

  successResponse(res, 200, 'Şifre başarıyla değiştirildi', null);
});

// ==================== ADMIN İŞLEMLERİ ====================

/**
 * @route   GET /api/users
 * @desc    Tüm kullanıcıları getir
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, rol, aktif } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  // Filtre oluştur
  const filter = {};

  if (rol) {
    filter.rol = rol;
  }

  if (aktif !== undefined) {
    filter.aktif = aktif === 'true';
  }

  // Kullanıcıları getir
  const users = await User.find(filter)
    .sort({ olusturmaTarihi: -1 })
    .skip(skip)
    .limit(limitNum);

  // Toplam sayıyı al
  const total = await User.countDocuments(filter);

  // Response gönder
  const responseData = paginationResponse(users, total, pageNum, limitNum);

  successResponse(res, 200, 'Kullanıcılar başarıyla getirildi', responseData);
});

/**
 * @route   GET /api/users/:id
 * @desc    Tek bir kullanıcıyı getir
 * @access  Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  successResponse(res, 200, 'Kullanıcı başarıyla getirildi', user);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Kullanıcı bilgilerini güncelle (admin)
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Admin tarafından güncellenebilir alanlar
  const allowedUpdates = ['adSoyad', 'email', 'telefon', 'rol', 'aktif'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  // Eğer email güncelleniyorsa, başka kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return next(new AppError('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor', 400));
    }
  }

  user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  successResponse(res, 200, 'Kullanıcı başarıyla güncellendi', user);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Kullanıcı sil
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  // Admin kendini silemesin
  if (user._id.toString() === req.user.id) {
    return next(new AppError('Kendi hesabınızı silemezsiniz', 400));
  }

  await user.deleteOne();

  successResponse(res, 200, 'Kullanıcı başarıyla silindi', null);
});

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Kullanıcı durumunu aktif/pasif yap
 * @access  Private/Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Kullanıcı bulunamadı', 404));
  }

  // Admin kendini pasif yapmasın
  if (user._id.toString() === req.user.id) {
    return next(new AppError('Kendi hesabınızın durumunu değiştiremezsiniz', 400));
  }

  user.aktif = !user.aktif;
  await user.save();

  const durum = user.aktif ? 'aktif' : 'pasif';

  successResponse(res, 200, `Kullanıcı ${durum} yapıldı`, user);
});
