const express = require('express');
const router = express.Router();
const siparisController = require('../controllers/siparisController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  siparisValidation,
  siparisStatusValidation,
  validateObjectId,
  paginationValidation
} = require('../middleware/validators');

/**
 * @route   POST /api/siparisler
 * @desc    Yeni sipariş oluştur
 * @access  Public
 */
router.post('/', siparisValidation, siparisController.createSiparis);

/**
 * @route   GET /api/siparisler/istatistik
 * @desc    Sipariş istatistiklerini getir
 * @access  Private/Admin
 */
router.get('/istatistik', protect, adminOnly, siparisController.getSiparisIstatistik);

/**
 * @route   GET /api/siparisler
 * @desc    Tüm siparişleri getir (pagination, filtre)
 * @access  Private/Admin
 */
router.get('/', protect, adminOnly, paginationValidation, siparisController.getAllSiparisler);

/**
 * @route   GET /api/siparisler/durum/:durum
 * @desc    Duruma göre siparişleri getir
 * @access  Private/Admin
 */
router.get('/durum/:durum', protect, adminOnly, paginationValidation, siparisController.getSiparislerByDurum);

/**
 * @route   GET /api/siparisler/:id
 * @desc    Tek bir siparişi getir
 * @access  Private/Admin
 */
router.get('/:id', protect, adminOnly, validateObjectId('id'), siparisController.getSiparis);

/**
 * @route   PUT /api/siparisler/:id
 * @desc    Sipariş güncelle
 * @access  Private/Admin
 */
router.put('/:id', protect, adminOnly, validateObjectId('id'), siparisController.updateSiparis);

/**
 * @route   PATCH /api/siparisler/:id/durum
 * @desc    Sipariş durumu güncelle
 * @access  Private/Admin
 */
router.patch('/:id/durum', protect, adminOnly, validateObjectId('id'), siparisStatusValidation, siparisController.updateSiparisDurum);

/**
 * @route   DELETE /api/siparisler/:id
 * @desc    Sipariş sil
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, validateObjectId('id'), siparisController.deleteSiparis);

module.exports = router;
