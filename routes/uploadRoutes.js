const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { uploadImages, uploadSingleImage } = require('../controllers/uploadController');

/**
 * Upload Routes
 * Dosya yükleme endpoint'leri
 */

// @route   POST /api/upload
// @desc    Çoklu dosya yükle (maksimum 10)
// @access  Public (auth middleware eklenebilir)
router.post(
  '/',
  upload.array('files', 10),
  handleMulterError,
  uploadImages
);

// @route   POST /api/upload/single
// @desc    Tek dosya yükle
// @access  Public (auth middleware eklenebilir)
router.post(
  '/single',
  upload.single('file'),
  handleMulterError,
  uploadSingleImage
);

module.exports = router;
