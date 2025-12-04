const mongoose = require('mongoose');

const siparisSchema = new mongoose.Schema({
  musteriAdi: {
    type: String,
    required: [true, 'Müşteri adı zorunludur'],
    trim: true,
    maxlength: [200, 'Müşteri adı 200 karakterden fazla olamaz']
  },
  telefon: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    trim: true,
    match: [/^[0-9\s\(\)\-\+]+$/, 'Geçerli bir telefon numarası giriniz']
  },
  adres: {
    type: String,
    required: [true, 'Adres zorunludur'],
    maxlength: [500, 'Adres 500 karakterden fazla olamaz']
  },
  urun: {
    urunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Urun',
      required: true
    },
    ad: {
      type: String,
      required: true
    },
    kod: {
      type: String,
      required: true
    },
    fiyat: {
      type: Number,
      required: true
    },
    kategori: {
      type: String,
      required: true
    }
  },
  durum: {
    type: String,
    enum: ['Yeni', 'İşlemde', 'Üretimde', 'Tamamlandı', 'İptal'],
    default: 'Yeni'
  },
  notlar: {
    type: String,
    maxlength: [1000, 'Notlar 1000 karakterden fazla olamaz']
  },
  tarih: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index oluştur
siparisSchema.index({ durum: 1 });
siparisSchema.index({ tarih: -1 });
siparisSchema.index({ 'urun.urunId': 1 });

module.exports = mongoose.model('Siparis', siparisSchema);