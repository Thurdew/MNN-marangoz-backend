const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getYorumlar,
  getYorumStats,
  createYorum,
  approveYorum,
  deleteYorum
} = require('../controllers/yorumController');

/**
 * Yorum Routes
 * Müşteri yorumları endpoint'leri
 */

// Validation rules
const yorumValidation = [
  body('musteriAdi')
    .trim()
    .notEmpty().withMessage('Müşteri adı zorunludur')
    .isLength({ min: 2, max: 100 }).withMessage('Müşteri adı 2-100 karakter arasında olmalıdır'),

  body('musteriResim')
    .optional()
    .trim(),

  body('yildiz')
    .notEmpty().withMessage('Yıldız puanı zorunludur')
    .isInt({ min: 1, max: 5 }).withMessage('Yıldız puanı 1-5 arasında olmalıdır'),

  body('yorum')
    .trim()
    .notEmpty().withMessage('Yorum metni zorunludur')
    .isLength({ min: 10, max: 1000 }).withMessage('Yorum 10-1000 karakter arasında olmalıdır'),

  body('hizmet')
    .trim()
    .notEmpty().withMessage('Hizmet bilgisi zorunludur')
    .isLength({ max: 100 }).withMessage('Hizmet bilgisi en fazla 100 karakter olabilir'),

  body('fotograflar')
    .optional()
    .isArray().withMessage('Fotoğraflar dizi olmalıdır')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('En fazla 10 fotoğraf yüklenebilir');
      }
      return true;
    })
];

// @route   GET /api/yorumlar/stats
// @desc    Yorum istatistiklerini getir
// @access  Public
// NOT: Bu route /api/yorumlar/:id route'undan önce olmalı
router.get('/stats', getYorumStats);

// @route   GET /api/yorumlar
// @desc    Yorumları getir
// @access  Public
router.get('/', getYorumlar);

// @route   POST /api/yorumlar
// @desc    Yeni yorum oluştur
// @access  Public
router.post('/', yorumValidation, createYorum);

// @route   PATCH /api/yorumlar/:id/approve
// @desc    Yorumu onayla
// @access  Private (Admin only - auth middleware eklenebilir)
router.patch('/:id/approve', approveYorum);

// @route   DELETE /api/yorumlar/:id
// @desc    Yorumu sil
// @access  Private (Admin only - auth middleware eklenebilir)
router.delete('/:id', deleteYorum);

module.exports = router;
