const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTeklifler,
  getTeklif,
  createTeklif,
  updateTeklifStatus,
  deleteTeklif
} = require('../controllers/teklifController');

/**
 * Teklif Routes
 * Teklif endpoint'leri
 */

// Validation rules
const teklifValidation = [
  body('adSoyad')
    .trim()
    .notEmpty().withMessage('Ad soyad zorunludur')
    .isLength({ min: 2, max: 100 }).withMessage('Ad soyad 2-100 karakter arasında olmalıdır'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email zorunludur')
    .isEmail().withMessage('Geçerli bir email adresi giriniz')
    .normalizeEmail(),

  body('telefon')
    .trim()
    .notEmpty().withMessage('Telefon zorunludur')
    .matches(/^[0-9]{10}$/).withMessage('Telefon 10 haneli olmalıdır (örn: 5551234567)'),

  body('adres')
    .trim()
    .notEmpty().withMessage('Adres zorunludur')
    .isLength({ max: 500 }).withMessage('Adres en fazla 500 karakter olabilir'),

  body('hizmet')
    .trim()
    .notEmpty().withMessage('Hizmet türü zorunludur')
    .isIn(['mutfak', 'gardirop', 'vestiyer', 'tv', 'Mutfak Dolabı', 'Mutfak', 'Gardirop', 'Vestiyer', 'TV Ünitesi', 'TV']).withMessage('Geçersiz hizmet türü'),

  body('genislik')
    .notEmpty().withMessage('Genişlik zorunludur')
    .isFloat({ min: 10, max: 5000 }).withMessage('Genişlik 10-5000 cm arasında olmalıdır'),

  body('yukseklik')
    .notEmpty().withMessage('Yükseklik zorunludur')
    .isFloat({ min: 10, max: 5000 }).withMessage('Yükseklik 10-5000 cm arasında olmalıdır'),

  body('derinlik')
    .notEmpty().withMessage('Derinlik zorunludur')
    .isFloat({ min: 10, max: 5000 }).withMessage('Derinlik 10-5000 cm arasında olmalıdır'),

  body('malzeme')
    .trim()
    .notEmpty().withMessage('Malzeme seçimi zorunludur')
    .isIn(['sunta', 'mdf', 'Sunta', 'MDF', 'Mdf']).withMessage('Geçersiz malzeme türü'),

  body('ekOzellikler')
    .optional()
    .isArray().withMessage('Ek özellikler dizi olmalıdır')
    .custom((value) => {
      const gecerliOzellikler = ['cnc', 'ayna'];
      const hataliOzellik = value.find(item => !gecerliOzellikler.includes(item));
      if (hataliOzellik) {
        throw new Error(`Geçersiz ek özellik: ${hataliOzellik}`);
      }
      return true;
    }),

  body('cekmeceAdedi')
    .optional()
    .isInt({ min: 0, max: 20 }).withMessage('Çekmece adedi 0-20 arasında olmalıdır'),

  body('notlar')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notlar en fazla 1000 karakter olabilir')
];

// @route   GET /api/teklif
// @desc    Teklifleri getir
// @access  Private (Admin only)
router.get('/', protect, adminOnly, getTeklifler);

// @route   GET /api/teklif/:id
// @desc    Tek teklif getir
// @access  Private (Admin only)
router.get('/:id', protect, adminOnly, getTeklif);

// @route   POST /api/teklif
// @desc    Yeni teklif oluştur
// @access  Public
router.post('/', teklifValidation, createTeklif);

// @route   PATCH /api/teklif/:id/status
// @desc    Teklif durumunu güncelle
// @access  Private (Admin only)
router.patch('/:id/status', protect, adminOnly, updateTeklifStatus);

// @route   DELETE /api/teklif/:id
// @desc    Teklifi sil
// @access  Private (Admin only)
router.delete('/:id', protect, adminOnly, deleteTeklif);

module.exports = router;
