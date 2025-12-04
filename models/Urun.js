const mongoose = require('mongoose');

const urunSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: [true, 'Ürün adı zorunludur'],
    trim: true,
    maxlength: [200, 'Ürün adı 200 karakterden fazla olamaz']
  },
  kod: {
    type: String,
    required: [true, 'Ürün kodu zorunludur'],
    unique: true,
    trim: true,
    uppercase: true
  },
  fiyat: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat negatif olamaz']
  },
  kategori: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    enum: ['Mutfak', 'Yatak Odası', 'Salon', 'Banyo', 'Özel Tasarım', 'Diğer'],
    default: 'Diğer'
  },
  aciklama: {
    type: String,
    required: [true, 'Açıklama zorunludur'],
    maxlength: [2000, 'Açıklama 2000 karakterden fazla olamaz']
  },
  malzeme: {
    type: String,
    required: [true, 'Malzeme bilgisi zorunludur'],
    trim: true
  },
  olculer: {
    genislik: {
      type: Number,
      min: [0, 'Genişlik negatif olamaz']
    },
    yukseklik: {
      type: Number,
      min: [0, 'Yükseklik negatif olamaz']
    },
    derinlik: {
      type: Number,
      min: [0, 'Derinlik negatif olamaz']
    }
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
  tarih: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index oluştur
urunSchema.index({ kod: 1 });
urunSchema.index({ kategori: 1 });
urunSchema.index({ tarih: -1 });

module.exports = mongoose.model('Urun', urunSchema);