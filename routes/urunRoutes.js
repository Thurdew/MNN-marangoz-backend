const express = require('express');
const router = express.Router();
const urunController = require('../controllers/urunController');
const { protect, adminOnly } = require('../middleware/auth');
const { urunValidation, validateObjectId, paginationValidation } = require('../middleware/validators');

/**
 * @route   GET /api/urunler
 * @desc    Tüm ürünleri getir (pagination, filtre)
 * @access  Public
 */
router.get('/', paginationValidation, urunController.getAllUrunler);

/**
 * @route   GET /api/urunler/kategori/:kategori
 * @desc    Kategoriye göre ürünleri getir
 * @access  Public
 */
router.get('/kategori/:kategori', paginationValidation, urunController.getUrunlerByKategori);

/**
 * @route   GET /api/urunler/:id
 * @desc    Tek bir ürünü getir
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), urunController.getUrun);

/**
 * @route   POST /api/urunler
 * @desc    Yeni ürün ekle
 * @access  Private/Admin
 */
router.post('/', protect, adminOnly, urunValidation, urunController.createUrun);

/**
 * @route   PUT /api/urunler/:id
 * @desc    Ürün güncelle
 * @access  Private/Admin
 */
router.put('/:id', protect, adminOnly, validateObjectId('id'), urunValidation, urunController.updateUrun);

/**
 * @route   DELETE /api/urunler/:id
 * @desc    Ürün sil
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, validateObjectId('id'), urunController.deleteUrun);

module.exports = router;
