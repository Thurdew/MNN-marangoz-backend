const mongoose = require('mongoose');

const galeriSchema = new mongoose.Schema({
  baslik: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden fazla olamaz']
  },
  aciklama: {
    type: String,
    maxlength: [1000, 'Açıklama 1000 karakterden fazla olamaz']
  },
  kategori: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    enum: ['Mutfak', 'Yatak Odası', 'Salon', 'Banyo', 'Özel Tasarım', 'Diğer'],
    default: 'Diğer'
  },
  resimUrl: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'En az bir resim URL\'si gereklidir'
    }
  },
  tamamlanmaTarihi: {
    type: Date,
    default: Date.now
  },
  musteriAdi: {
    type: String,
    trim: true
  },
  konum: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index oluştur
galeriSchema.index({ kategori: 1 });
galeriSchema.index({ tamamlanmaTarihi: -1 });

module.exports = mongoose.model('Galeri', galeriSchema);