const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getSettings, updateSettings } = require('../controllers/settingsController');

/**
 * Settings Routes
 * Fiyat ayarları endpoint'leri
 */

// Validation rules
const settingsValidation = [
  body('metreFiyat')
    .optional()
    .isNumeric().withMessage('Metre fiyat sayı olmalıdır')
    .isFloat({ min: 0 }).withMessage('Metre fiyat 0\'dan küçük olamaz'),

  body('cekmeceUcretsizLimit')
    .optional()
    .isInt({ min: 0, max: 20 }).withMessage('Ücretsiz çekmece limiti 0-20 arasında olmalıdır'),

  body('cekmeceBirimFiyat')
    .optional()
    .isNumeric().withMessage('Çekmece birim fiyat sayı olmalıdır')
    .isFloat({ min: 0 }).withMessage('Çekmece birim fiyat 0\'dan küçük olamaz'),

  body('cnc.acik')
    .optional()
    .isBoolean().withMessage('CNC açık değeri boolean olmalıdır'),

  body('cnc.fiyat')
    .optional()
    .isNumeric().withMessage('CNC fiyat sayı olmalıdır')
    .isFloat({ min: 0 }).withMessage('CNC fiyat 0\'dan küçük olamaz'),

  body('ayna.acik')
    .optional()
    .isBoolean().withMessage('Ayna açık değeri boolean olmalıdır'),

  body('ayna.fiyat')
    .optional()
    .isNumeric().withMessage('Ayna fiyat sayı olmalıdır')
    .isFloat({ min: 0 }).withMessage('Ayna fiyat 0\'dan küçük olamaz')
];

// @route   GET /api/ayarlar
// @desc    Ayarları getir
// @access  Public
router.get('/', getSettings);

// @route   POST /api/ayarlar
// @desc    Ayarları güncelle
// @access  Private (Admin only - auth middleware eklenebilir)
router.post('/', settingsValidation, updateSettings);

module.exports = router;
