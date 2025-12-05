const express = require('express');
const router = express.Router();
const galeriController = require('../controllers/galeriController');
const { protect, adminOnly } = require('../middleware/auth');
const { galeriValidation, validateObjectId, paginationValidation } = require('../middleware/validators');

/**
 * @route   GET /api/galeri
 * @desc    Tüm galeri öğelerini getir (pagination, filtre)
 * @access  Public
 */
router.get('/', paginationValidation, galeriController.getAllGaleri);

/**
 * @route   GET /api/galeri/kategori/:kategori
 * @desc    Kategoriye göre galeri öğelerini getir
 * @access  Public
 */
router.get('/kategori/:kategori', paginationValidation, galeriController.getGaleriByKategori);

/**
 * @route   GET /api/galeri/:id
 * @desc    Tek bir galeri öğesini getir
 * @access  Public
 */
router.get('/:id', validateObjectId('id'), galeriController.getGaleriItem);

/**
 * @route   POST /api/galeri
 * @desc    Yeni galeri öğesi ekle
 * @access  Private/Admin
 */
router.post('/', protect, adminOnly, galeriValidation, galeriController.createGaleriItem);

/**
 * @route   PUT /api/galeri/:id
 * @desc    Galeri öğesi güncelle
 * @access  Private/Admin
 */
router.put('/:id', protect, adminOnly, validateObjectId('id'), galeriValidation, galeriController.updateGaleriItem);

/**
 * @route   DELETE /api/galeri/:id
 * @desc    Galeri öğesi sil
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, validateObjectId('id'), galeriController.deleteGaleriItem);

module.exports = router;
