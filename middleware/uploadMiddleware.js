const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads dizininin var olduğundan emin ol
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur: timestamp-randomnumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // Türkçe karakterleri ve boşlukları temizle
    const sanitizedName = nameWithoutExt
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-');
    cb(null, uniqueSuffix + '-' + sanitizedName + ext);
  }
});

// File Filter - Sadece resim dosyalarına izin ver
const fileFilter = (req, file, cb) => {
  // İzin verilen MIME tipleri
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları (JPEG, JPG, PNG, WebP, GIF) yüklenebilir'), false);
  }
};

// Multer Configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maksimum dosya boyutu
  }
});

// Multer Error Handler Middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer'a özgü hatalar
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük. Maksimum 5MB yükleyebilirsiniz.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Çok fazla dosya yüklemeye çalışıyorsunuz.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Beklenmeyen dosya alanı.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Dosya yükleme hatası: ' + err.message
    });
  } else if (err) {
    // Diğer hatalar (örneğin fileFilter hatası)
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  handleMulterError
};
