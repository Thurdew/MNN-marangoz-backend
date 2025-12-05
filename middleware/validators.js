const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Validasyon hatalarını kontrol eden middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasyon hatası',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

/**
 * MongoDB ObjectId validasyonu
 */
const validateObjectId = (fieldName = 'id') => {
  return param(fieldName)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Geçersiz ID formatı');
      }
      return true;
    });
};

// ==================== AUTH VALİDASYONLARI ====================

const registerValidation = [
  body('kullaniciAdi')
    .trim()
    .notEmpty().withMessage('Kullanıcı adı zorunludur')
    .isLength({ min: 3 }).withMessage('Kullanıcı adı en az 3 karakter olmalıdır')
    .isLength({ max: 50 }).withMessage('Kullanıcı adı en fazla 50 karakter olabilir')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),

  body('sifre')
    .notEmpty().withMessage('Şifre zorunludur')
    .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
    .isLength({ max: 100 }).withMessage('Şifre en fazla 100 karakter olabilir'),

  body('adSoyad')
    .trim()
    .notEmpty().withMessage('Ad soyad zorunludur')
    .isLength({ min: 3 }).withMessage('Ad soyad en az 3 karakter olmalıdır')
    .isLength({ max: 100 }).withMessage('Ad soyad en fazla 100 karakter olabilir'),

  body('email')
    .trim()
    .notEmpty().withMessage('E-posta zorunludur')
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('telefon')
    .optional()
    .trim()
    .matches(/^[0-9\s\(\)\-\+]+$/).withMessage('Geçerli bir telefon numarası giriniz'),

  validate
];

const loginValidation = [
  body('kullaniciAdi')
    .trim()
    .notEmpty().withMessage('Kullanıcı adı zorunludur'),

  body('sifre')
    .notEmpty().withMessage('Şifre zorunludur'),

  validate
];

// ==================== ÜRÜN VALİDASYONLARI ====================

const urunValidation = [
  body('ad')
    .trim()
    .notEmpty().withMessage('Ürün adı zorunludur')
    .isLength({ max: 200 }).withMessage('Ürün adı 200 karakterden fazla olamaz'),

  body('kod')
    .trim()
    .notEmpty().withMessage('Ürün kodu zorunludur')
    .isLength({ max: 50 }).withMessage('Ürün kodu 50 karakterden fazla olamaz'),

  body('fiyat')
    .notEmpty().withMessage('Fiyat zorunludur')
    .isFloat({ min: 0 }).withMessage('Fiyat 0 veya daha büyük olmalıdır'),

  body('kategori')
    .notEmpty().withMessage('Kategori zorunludur')
    .isIn(['Mutfak', 'Yatak Odası', 'Salon', 'Banyo', 'Özel Tasarım', 'Diğer'])
    .withMessage('Geçersiz kategori'),

  body('aciklama')
    .trim()
    .notEmpty().withMessage('Açıklama zorunludur')
    .isLength({ max: 2000 }).withMessage('Açıklama 2000 karakterden fazla olamaz'),

  body('malzeme')
    .trim()
    .notEmpty().withMessage('Malzeme bilgisi zorunludur'),

  body('olculer.genislik')
    .optional()
    .isFloat({ min: 0 }).withMessage('Genişlik 0 veya daha büyük olmalıdır'),

  body('olculer.yukseklik')
    .optional()
    .isFloat({ min: 0 }).withMessage('Yükseklik 0 veya daha büyük olmalıdır'),

  body('olculer.derinlik')
    .optional()
    .isFloat({ min: 0 }).withMessage('Derinlik 0 veya daha büyük olmalıdır'),

  body('resimUrl')
    .isArray({ min: 1 }).withMessage('En az bir resim URL\'si gereklidir')
    .custom((value) => {
      if (!value.every(url => typeof url === 'string')) {
        throw new Error('Tüm resim URL\'leri string olmalıdır');
      }
      return true;
    }),

  validate
];

// ==================== GALERİ VALİDASYONLARI ====================

const galeriValidation = [
  body('baslik')
    .trim()
    .notEmpty().withMessage('Başlık zorunludur')
    .isLength({ max: 200 }).withMessage('Başlık 200 karakterden fazla olamaz'),

  body('aciklama')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Açıklama 1000 karakterden fazla olamaz'),

  body('kategori')
    .notEmpty().withMessage('Kategori zorunludur')
    .isIn(['Mutfak', 'Yatak Odası', 'Salon', 'Banyo', 'Özel Tasarım', 'Diğer'])
    .withMessage('Geçersiz kategori'),

  body('resimUrl')
    .isArray({ min: 1 }).withMessage('En az bir resim URL\'si gereklidir'),

  body('musteriAdi')
    .optional()
    .trim(),

  body('konum')
    .optional()
    .trim(),

  validate
];

// ==================== SİPARİŞ VALİDASYONLARI ====================

const siparisValidation = [
  body('musteriAdi')
    .trim()
    .notEmpty().withMessage('Müşteri adı zorunludur')
    .isLength({ max: 200 }).withMessage('Müşteri adı 200 karakterden fazla olamaz'),

  body('telefon')
    .trim()
    .notEmpty().withMessage('Telefon numarası zorunludur')
    .matches(/^[0-9\s\(\)\-\+]+$/).withMessage('Geçerli bir telefon numarası giriniz'),

  body('adres')
    .trim()
    .notEmpty().withMessage('Adres zorunludur')
    .isLength({ max: 500 }).withMessage('Adres 500 karakterden fazla olamaz'),

  body('urun.urunId')
    .notEmpty().withMessage('Ürün ID zorunludur')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Geçersiz ürün ID');
      }
      return true;
    }),

  body('urun.ad')
    .notEmpty().withMessage('Ürün adı zorunludur'),

  body('urun.kod')
    .notEmpty().withMessage('Ürün kodu zorunludur'),

  body('urun.fiyat')
    .notEmpty().withMessage('Ürün fiyatı zorunludur')
    .isFloat({ min: 0 }).withMessage('Fiyat 0 veya daha büyük olmalıdır'),

  body('urun.kategori')
    .notEmpty().withMessage('Ürün kategorisi zorunludur'),

  body('notlar')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notlar 1000 karakterden fazla olamaz'),

  validate
];

const siparisStatusValidation = [
  body('durum')
    .notEmpty().withMessage('Durum zorunludur')
    .isIn(['Yeni', 'İşlemde', 'Üretimde', 'Tamamlandı', 'İptal'])
    .withMessage('Geçersiz sipariş durumu'),

  validate
];

// ==================== KULLANICI VALİDASYONLARI ====================

const userUpdateValidation = [
  body('adSoyad')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Ad soyad 3-100 karakter arasında olmalıdır'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),

  body('telefon')
    .optional()
    .trim()
    .matches(/^[0-9\s\(\)\-\+]+$/).withMessage('Geçerli bir telefon numarası giriniz'),

  validate
];

const changePasswordValidation = [
  body('eskiSifre')
    .notEmpty().withMessage('Eski şifre zorunludur'),

  body('yeniSifre')
    .notEmpty().withMessage('Yeni şifre zorunludur')
    .isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır')
    .custom((value, { req }) => {
      if (value === req.body.eskiSifre) {
        throw new Error('Yeni şifre eski şifreden farklı olmalıdır');
      }
      return true;
    }),

  validate
];

// ==================== PAGİNATİON VALİDASYONU ====================

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Sayfa numarası 1 veya daha büyük olmalıdır'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),

  validate
];

module.exports = {
  validate,
  validateObjectId,
  registerValidation,
  loginValidation,
  urunValidation,
  galeriValidation,
  siparisValidation,
  siparisStatusValidation,
  userUpdateValidation,
  changePasswordValidation,
  paginationValidation
};
