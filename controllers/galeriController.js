const Galeri = require('../models/Galeri');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, getPagination, paginationResponse } = require('../utils/responseHelper');

/**
 * @route   GET /api/galeri
 * @desc    Tüm galeri öğelerini getir (pagination ile)
 * @access  Public
 */
exports.getAllGaleri = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, kategori } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  // Filtre oluştur
  const filter = {};

  if (kategori) {
    filter.kategori = kategori;
  }

  // Galeri öğelerini getir
  const galeriOgeleri = await Galeri.find(filter)
    .sort({ tamamlanmaTarihi: -1 })
    .skip(skip)
    .limit(limitNum);

  // Toplam sayıyı al
  const total = await Galeri.countDocuments(filter);

  // Response gönder - Direkt format (iç içe data objesi olmaması için)
  res.status(200).json({
    success: true,
    data: galeriOgeleri,
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
 * @route   GET /api/galeri/:id
 * @desc    Tek bir galeri öğesini getir
 * @access  Public
 */
exports.getGaleriItem = asyncHandler(async (req, res, next) => {
  const galeriOgesi = await Galeri.findById(req.params.id);

  if (!galeriOgesi) {
    return next(new AppError('Galeri öğesi bulunamadı', 404));
  }

  successResponse(res, 200, 'Galeri öğesi başarıyla getirildi', galeriOgesi);
});

/**
 * @route   POST /api/galeri
 * @desc    Yeni galeri öğesi ekle
 * @access  Private/Admin
 */
exports.createGaleriItem = asyncHandler(async (req, res, next) => {
  const yeniGaleriOgesi = await Galeri.create(req.body);

  successResponse(res, 201, 'İş galeriye başarıyla eklendi', yeniGaleriOgesi);
});

/**
 * @route   PUT /api/galeri/:id
 * @desc    Galeri öğesi güncelle
 * @access  Private/Admin
 */
exports.updateGaleriItem = asyncHandler(async (req, res, next) => {
  let galeriOgesi = await Galeri.findById(req.params.id);

  if (!galeriOgesi) {
    return next(new AppError('Galeri öğesi bulunamadı', 404));
  }

  galeriOgesi = await Galeri.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  successResponse(res, 200, 'Galeri öğesi başarıyla güncellendi', galeriOgesi);
});

/**
 * @route   DELETE /api/galeri/:id
 * @desc    Galeri öğesi sil
 * @access  Private/Admin
 */
exports.deleteGaleriItem = asyncHandler(async (req, res, next) => {
  const galeriOgesi = await Galeri.findById(req.params.id);

  if (!galeriOgesi) {
    return next(new AppError('Galeri öğesi bulunamadı', 404));
  }

  await galeriOgesi.deleteOne();

  successResponse(res, 200, 'Galeri öğesi başarıyla silindi', null);
});

/**
 * @route   GET /api/galeri/kategori/:kategori
 * @desc    Kategoriye göre galeri öğelerini getir
 * @access  Public
 */
exports.getGaleriByKategori = asyncHandler(async (req, res, next) => {
  const { kategori } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Pagination hesapla
  const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

  const galeriOgeleri = await Galeri.find({ kategori })
    .sort({ tamamlanmaTarihi: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Galeri.countDocuments({ kategori });

  // Response gönder - Direkt format
  res.status(200).json({
    success: true,
    data: galeriOgeleri,
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
