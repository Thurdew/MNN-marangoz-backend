const mongoose = require('mongoose');

const teklifSchema = new mongoose.Schema({
  // Müşteri Bilgileri
  adSoyad: {
    type: String,
    required: [true, 'Ad soyad zorunludur'],
    trim: true,
    minlength: [2, 'Ad soyad en az 2 karakter olmalıdır'],
    maxlength: [100, 'Ad soyad en fazla 100 karakter olabilir']
  },
  email: {
    type: String,
    required: [true, 'Email zorunludur'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir email adresi giriniz']
  },
  telefon: {
    type: String,
    required: [true, 'Telefon zorunludur'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Geçerli bir telefon numarası giriniz (10 haneli)']
  },
  adres: {
    type: String,
    required: [true, 'Adres zorunludur'],
    trim: true,
    maxlength: [500, 'Adres en fazla 500 karakter olabilir']
  },

  // Hizmet Bilgileri
  hizmet: {
    type: String,
    required: [true, 'Hizmet türü zorunludur'],
    enum: {
      values: ['mutfak', 'gardirop', 'vestiyer', 'tv'],
      message: '{VALUE} geçerli bir hizmet türü değil'
    }
  },

  // Ölçüler
  genislik: {
    type: Number,
    required: [true, 'Genişlik zorunludur'],
    min: [0.1, 'Genişlik en az 0.1 metre olmalıdır'],
    max: [50, 'Genişlik en fazla 50 metre olabilir']
  },
  yukseklik: {
    type: Number,
    required: [true, 'Yükseklik zorunludur'],
    min: [0.1, 'Yükseklik en az 0.1 metre olmalıdır'],
    max: [50, 'Yükseklik en fazla 50 metre olabilir']
  },
  derinlik: {
    type: Number,
    required: [true, 'Derinlik zorunludur'],
    min: [0.1, 'Derinlik en az 0.1 metre olmalıdır'],
    max: [50, 'Derinlik en fazla 50 metre olabilir']
  },

  // Malzeme ve Özellikler
  malzeme: {
    type: String,
    required: [true, 'Malzeme seçimi zorunludur'],
    enum: {
      values: ['sunta', 'mdf'],
      message: '{VALUE} geçerli bir malzeme türü değil'
    }
  },
  ekOzellikler: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.every(item => ['cnc', 'ayna'].includes(item));
      },
      message: 'Geçersiz ek özellik. Sadece cnc ve ayna seçilebilir'
    }
  },
  cekmeceAdedi: {
    type: Number,
    default: 0,
    min: [0, 'Çekmece adedi 0\'dan küçük olamaz'],
    max: [20, 'Çekmece adedi en fazla 20 olabilir']
  },

  // Fiyat Detayları
  fiyatDetay: {
    temelFiyat: {
      type: Number,
      default: 0
    },
    malzemeFiyat: {
      type: Number,
      default: 0
    },
    ekOzelliklerFiyat: {
      type: Number,
      default: 0
    },
    cekmeceFiyat: {
      type: Number,
      default: 0
    },
    toplamFiyat: {
      type: Number,
      default: 0
    }
  },

  // Notlar ve Durum
  notlar: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notlar en fazla 1000 karakter olabilir']
  },
  durum: {
    type: String,
    default: 'beklemede',
    enum: {
      values: ['beklemede', 'inceleniyor', 'teklif-gonderildi', 'onaylandi', 'reddedildi'],
      message: '{VALUE} geçerli bir durum değil'
    }
  }
}, {
  timestamps: true
});

// Index'ler
teklifSchema.index({ email: 1 });
teklifSchema.index({ durum: 1 });
teklifSchema.index({ createdAt: -1 });

// Virtual: Alan hesaplama
teklifSchema.virtual('alan').get(function() {
  return this.genislik * this.yukseklik * this.derinlik;
});

// JSON'a dönüştürüldüğünde virtual alanları dahil et
teklifSchema.set('toJSON', { virtuals: true });
teklifSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Teklif', teklifSchema);
