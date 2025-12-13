const Siparis = require('../models/Siparis');
const Urun = require('../models/Urun');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, getPagination, paginationResponse } = require('../utils/responseHelper');

/**
 * @route   POST /api/siparisler
 * @desc    Yeni sipariş oluştur
 * @access  Public
 */
exports.createSiparis = asyncHandler(async (req, res, next) => {
  const { urun } = req.body;

  // Ürünün gerçekten var olup olmadığını kontrol et
  const urunVeritabani = await Urun.findById(urun.urunId);

  if (!urunVeritabani) {
    return next(new AppError('Belirtilen ürün bulunamadı', 404));
  }

  // Sipariş oluştur
  const yeniSiparis = await Siparis.create(req.body);

  successResponse(res, 201, 'Siparişiniz alındı. En kısa sürede sizinle iletişime geçeceğiz', yeniSiparis);
});

/**
 * @route   GET /api/siparisler
 * @desc    Tüm siparişleri getir (pagination ile)
 * @access  Private/Admin
 */
exports.getAllSiparisler = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, durum } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  // Filtre oluştur
  const filter = {};

  if (durum) {
    filter.durum = durum;
  }

  // Siparişleri getir
  const siparisler = await Siparis.find(filter)
    .sort({ tarih: -1 })
    .skip(skip)
    .limit(limitNum);

  // Toplam sayıyı al
  const total = await Siparis.countDocuments(filter);

  // Response gönder - Direkt format (iç içe data objesi olmaması için)
  res.status(200).json({
    success: true,
    data: siparisler,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    }
  });
});

/**
 * @route   GET /api/siparisler/:id
 * @desc    Tek bir siparişi getir
 * @access  Private/Admin
 */
exports.getSiparis = asyncHandler(async (req, res, next) => {
  const siparis = await Siparis.findById(req.params.id).populate('urun.urunId');

  if (!siparis) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  successResponse(res, 200, 'Sipariş başarıyla getirildi', siparis);
});

/**
 * @route   PUT /api/siparisler/:id
 * @desc    Sipariş güncelle (müşteri bilgileri veya notlar)
 * @access  Private/Admin
 */
exports.updateSiparis = asyncHandler(async (req, res, next) => {
  let siparis = await Siparis.findById(req.params.id);

  if (!siparis) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  // Sipariş durumu iptal veya tamamlandı ise güncellemeye izin verme
  if (siparis.durum === 'İptal' || siparis.durum === 'Tamamlandı') {
    return next(new AppError(`${siparis.durum} durumundaki sipariş güncellenemez`, 400));
  }

  siparis = await Siparis.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  successResponse(res, 200, 'Sipariş başarıyla güncellendi', siparis);
});

/**
 * @route   PATCH /api/siparisler/:id/durum
 * @desc    Sipariş durumu güncelle
 * @access  Private/Admin
 */
exports.updateSiparisDurum = asyncHandler(async (req, res, next) => {
  const { durum } = req.body;

  let siparis = await Siparis.findById(req.params.id);

  if (!siparis) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  siparis.durum = durum;
  await siparis.save();

  successResponse(res, 200, `Sipariş durumu "${durum}" olarak güncellendi`, siparis);
});

/**
 * @route   DELETE /api/siparisler/:id
 * @desc    Sipariş sil
 * @access  Private/Admin
 */
exports.deleteSiparis = asyncHandler(async (req, res, next) => {
  const siparis = await Siparis.findById(req.params.id);

  if (!siparis) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  await siparis.deleteOne();

  successResponse(res, 200, 'Sipariş başarıyla silindi', null);
});

/**
 * @route   GET /api/siparisler/durum/:durum
 * @desc    Duruma göre siparişleri getir
 * @access  Private/Admin
 */
exports.getSiparislerByDurum = asyncHandler(async (req, res, next) => {
  const { durum } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Durum geçerli mi kontrol et
  const validDurumlar = ['Yeni', 'İşlemde', 'Üretimde', 'Tamamlandı', 'İptal'];
  if (!validDurumlar.includes(durum)) {
    return next(new AppError('Geçersiz sipariş durumu', 400));
  }

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  const siparisler = await Siparis.find({ durum })
    .sort({ tarih: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Siparis.countDocuments({ durum });

  // Response gönder - Direkt format
  res.status(200).json({
    success: true,
    data: siparisler,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    }
  });
});

/**
 * @route   GET /api/siparisler/istatistik
 * @desc    Sipariş istatistiklerini getir
 * @access  Private/Admin
 */
exports.getSiparisIstatistik = asyncHandler(async (req, res, next) => {
  const istatistik = await Siparis.aggregate([
    {
      $group: {
        _id: '$durum',
        count: { $sum: 1 }
      }
    }
  ]);

  const toplam = await Siparis.countDocuments();

  const formattedIstatistik = istatistik.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  successResponse(res, 200, 'İstatistikler başarıyla getirildi', {
    toplam,
    durumlar: formattedIstatistik
  });
});
