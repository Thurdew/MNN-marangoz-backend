const Urun = require('../models/Urun');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/responseHelper');
const { getPagination, paginationResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/urunler
 * @desc    Tüm ürünleri getir (pagination ile)
 * @access  Public
 */
exports.getAllUrunler = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, kategori, search } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  // Filtre oluştur
  const filter = {};

  if (kategori) {
    filter.kategori = kategori;
  }

  if (search) {
    filter.$or = [
      { ad: { $regex: search, $options: 'i' } },
      { kod: { $regex: search, $options: 'i' } },
      { aciklama: { $regex: search, $options: 'i' } }
    ];
  }

  // Ürünleri getir
  const urunler = await Urun.find(filter)
    .sort({ tarih: -1 })
    .skip(skip)
    .limit(limitNum);

  // Toplam sayıyı al
  const total = await Urun.countDocuments(filter);

  // Response gönder
  const responseData = paginationResponse(urunler, total, pageNum, limitNum);

  successResponse(res, 200, 'Ürünler başarıyla getirildi', responseData);
});

/**
 * @route   GET /api/urunler/:id
 * @desc    Tek bir ürünü getir
 * @access  Public
 */
exports.getUrun = asyncHandler(async (req, res, next) => {
  const urun = await Urun.findById(req.params.id);

  if (!urun) {
    return next(new AppError('Ürün bulunamadı', 404));
  }

  successResponse(res, 200, 'Ürün başarıyla getirildi', urun);
});

/**
 * @route   POST /api/urunler
 * @desc    Yeni ürün ekle
 * @access  Private/Admin
 */
exports.createUrun = asyncHandler(async (req, res, next) => {
  console.log('📝 POST /api/urunler - Yeni ürün oluşturuluyor...');
  console.log('👤 Kullanıcı:', req.user?.email, '| Rol:', req.user?.rol);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  // Aynı kod ile ürün var mı kontrol et
  const existingUrun = await Urun.findOne({ kod: req.body.kod });

  if (existingUrun) {
    console.log('❌ Ürün kodu zaten kullanımda:', req.body.kod);
    return next(new AppError('Bu ürün kodu zaten kullanımda', 400));
  }

  const yeniUrun = await Urun.create(req.body);
  console.log('✅ Ürün başarıyla oluşturuldu:', yeniUrun._id);

  successResponse(res, 201, 'Ürün başarıyla eklendi', yeniUrun);
});

/**
 * @route   PUT /api/urunler/:id
 * @desc    Ürün güncelle
 * @access  Private/Admin
 */
exports.updateUrun = asyncHandler(async (req, res, next) => {
  let urun = await Urun.findById(req.params.id);

  if (!urun) {
    return next(new AppError('Ürün bulunamadı', 404));
  }

  // Eğer kod güncelleniyorsa, başka ürünün aynı kodu kullanıp kullanmadığını kontrol et
  if (req.body.kod && req.body.kod !== urun.kod) {
    const existingUrun = await Urun.findOne({ kod: req.body.kod });
    if (existingUrun) {
      return next(new AppError('Bu ürün kodu başka bir ürün tarafından kullanılıyor', 400));
    }
  }

  urun = await Urun.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  successResponse(res, 200, 'Ürün başarıyla güncellendi', urun);
});

/**
 * @route   DELETE /api/urunler/:id
 * @desc    Ürün sil
 * @access  Private/Admin
 */
exports.deleteUrun = asyncHandler(async (req, res, next) => {
  const urun = await Urun.findById(req.params.id);

  if (!urun) {
    return next(new AppError('Ürün bulunamadı', 404));
  }

  await urun.deleteOne();

  successResponse(res, 200, 'Ürün başarıyla silindi', null);
});

/**
 * @route   GET /api/urunler/kategori/:kategori
 * @desc    Kategoriye göre ürünleri getir
 * @access  Public
 */
exports.getUrunlerByKategori = asyncHandler(async (req, res, next) => {
  const { kategori } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  const urunler = await Urun.find({ kategori })
    .sort({ tarih: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Urun.countDocuments({ kategori });

  const responseData = paginationResponse(urunler, total, pageNum, limitNum);

  successResponse(res, 200, `${kategori} kategorisindeki ürünler getirildi`, responseData);
});
