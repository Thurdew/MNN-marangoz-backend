/**
 * Upload Controller
 * Dosya yükleme işlemlerini yönetir
 */

// @desc    Çoklu dosya yükle
// @route   POST /api/upload
// @access  Public (auth middleware eklenebilir)
const uploadImages = async (req, res) => {
  try {
    // Multer middleware tarafından işlenen dosyalar
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen en az bir dosya yükleyin'
      });
    }

    // Dosya URL'lerini oluştur
    const urls = req.files.map(file => {
      // Frontend için erişilebilir URL oluştur
      return `/uploads/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      message: `${req.files.length} dosya başarıyla yüklendi`,
      urls,
      files: req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/uploads/${file.filename}`
      }))
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yüklenirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Tek dosya yükle
// @route   POST /api/upload/single
// @access  Public (auth middleware eklenebilir)
const uploadSingleImage = async (req, res) => {
  try {
    // Multer middleware tarafından işlenen dosya
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir dosya yükleyin'
      });
    }

    // Dosya URL'ini oluştur
    const url = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      urls: [url],
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url
      }
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yüklenirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  uploadImages,
  uploadSingleImage
};
