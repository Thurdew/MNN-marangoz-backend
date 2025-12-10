const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Temel Fiyatlandırma
  metreFiyat: {
    type: Number,
    default: 11000,
    required: true,
    min: [0, 'Metre fiyat 0\'dan küçük olamaz']
  },

  // Çekmece Fiyatlandırması
  cekmeceUcretsizLimit: {
    type: Number,
    default: 3,
    required: true,
    min: [0, 'Ücretsiz çekmece limiti 0\'dan küçük olamaz'],
    max: [20, 'Ücretsiz çekmece limiti en fazla 20 olabilir']
  },
  cekmeceBirimFiyat: {
    type: Number,
    default: 1000,
    required: true,
    min: [0, 'Çekmece birim fiyat 0\'dan küçük olamaz']
  },

  // Ek Özellik Fiyatları
  cnc: {
    acik: {
      type: Boolean,
      default: true
    },
    fiyat: {
      type: Number,
      default: 5000,
      min: [0, 'CNC fiyat 0\'dan küçük olamaz']
    }
  },
  ayna: {
    acik: {
      type: Boolean,
      default: true
    },
    fiyat: {
      type: Number,
      default: 4000,
      min: [0, 'Ayna fiyat 0\'dan küçük olamaz']
    }
  }
}, {
  timestamps: true
});

// Sadece bir adet settings belgesi olmalı
settingsSchema.statics.getSingleSettings = async function() {
  try {
    let settings = await this.findOne();

    // Eğer hiç settings belgesi yoksa, varsayılan değerlerle oluştur
    if (!settings) {
      settings = await this.create({
        metreFiyat: 11000,
        cekmeceUcretsizLimit: 3,
        cekmeceBirimFiyat: 1000,
        cnc: {
          acik: true,
          fiyat: 5000
        },
        ayna: {
          acik: true,
          fiyat: 4000
        }
      });
    }

    return settings;
  } catch (error) {
    throw new Error('Ayarlar alınırken hata oluştu: ' + error.message);
  }
};

// Sadece bir ayar belgesi olması için pre-save hook
settingsSchema.pre('save', async function(next) {
  const Settings = this.constructor;

  // Eğer bu yeni bir belge ise ve başka bir belge varsa, hataya neden ol
  if (this.isNew) {
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      const error = new Error('Sadece bir ayar belgesi olabilir. Mevcut ayarları güncelleyin.');
      return next(error);
    }
  }

  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
