const mongoose = require('mongoose');

const yorumSchema = new mongoose.Schema({
  // Müşteri Bilgileri
  musteriAdi: {
    type: String,
    required: [true, 'Müşteri adı zorunludur'],
    trim: true,
    minlength: [2, 'Müşteri adı en az 2 karakter olmalıdır'],
    maxlength: [100, 'Müşteri adı en fazla 100 karakter olabilir']
  },
  musteriResim: {
    type: String,
    trim: true,
    default: null
  },

  // Değerlendirme
  yildiz: {
    type: Number,
    required: [true, 'Yıldız puanı zorunludur'],
    min: [1, 'Yıldız puanı en az 1 olmalıdır'],
    max: [5, 'Yıldız puanı en fazla 5 olabilir'],
    validate: {
      validator: Number.isInteger,
      message: 'Yıldız puanı tam sayı olmalıdır'
    }
  },

  // Yorum Metni
  yorum: {
    type: String,
    required: [true, 'Yorum metni zorunludur'],
    trim: true,
    minlength: [10, 'Yorum en az 10 karakter olmalıdır'],
    maxlength: [1000, 'Yorum en fazla 1000 karakter olabilir']
  },

  // Hizmet Bilgisi
  hizmet: {
    type: String,
    required: [true, 'Hizmet bilgisi zorunludur'],
    trim: true,
    maxlength: [100, 'Hizmet bilgisi en fazla 100 karakter olabilir']
  },

  // Fotoğraflar
  fotograflar: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 10;
      },
      message: 'En fazla 10 fotoğraf yüklenebilir'
    }
  },

  // Onay Durumu
  onaylandi: {
    type: Boolean,
    default: false
  },

  // Tarih
  tarih: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index'ler
yorumSchema.index({ onaylandi: 1 });
yorumSchema.index({ yildiz: -1 });
yorumSchema.index({ tarih: -1 });
yorumSchema.index({ createdAt: -1 });

// Static method: İstatistikler
yorumSchema.statics.getStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $match: { onaylandi: true }
      },
      {
        $group: {
          _id: null,
          toplamYorum: { $sum: 1 },
          ortalamaYildiz: { $avg: '$yildiz' },
          besYildizSayisi: {
            $sum: { $cond: [{ $eq: ['$yildiz', 5] }, 1, 0] }
          },
          dortYildizSayisi: {
            $sum: { $cond: [{ $eq: ['$yildiz', 4] }, 1, 0] }
          },
          ucYildizSayisi: {
            $sum: { $cond: [{ $eq: ['$yildiz', 3] }, 1, 0] }
          },
          ikiYildizSayisi: {
            $sum: { $cond: [{ $eq: ['$yildiz', 2] }, 1, 0] }
          },
          birYildizSayisi: {
            $sum: { $cond: [{ $eq: ['$yildiz', 1] }, 1, 0] }
          }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return {
        toplamYorum: 0,
        ortalamaYildiz: 0,
        besYildizYuzde: 0,
        dagitim: {
          besYildiz: 0,
          dortYildiz: 0,
          ucYildiz: 0,
          ikiYildiz: 0,
          birYildiz: 0
        }
      };
    }

    const result = stats[0];
    const besYildizYuzde = result.toplamYorum > 0
      ? Math.round((result.besYildizSayisi / result.toplamYorum) * 100)
      : 0;

    return {
      toplamYorum: result.toplamYorum,
      ortalamaYildiz: Math.round(result.ortalamaYildiz * 10) / 10, // Bir ondalık basamak
      besYildizYuzde,
      dagitim: {
        besYildiz: result.besYildizSayisi,
        dortYildiz: result.dortYildizSayisi,
        ucYildiz: result.ucYildizSayisi,
        ikiYildiz: result.ikiYildizSayisi,
        birYildiz: result.birYildizSayisi
      }
    };
  } catch (error) {
    throw new Error('İstatistikler alınırken hata oluştu: ' + error.message);
  }
};

module.exports = mongoose.model('Yorum', yorumSchema);
