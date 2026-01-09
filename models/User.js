const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  kullaniciAdi: {
    type: String,
    required: [true, 'Kullanıcı adı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır']
  },
  sifre: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // Sorgu sonuçlarında şifreyi otomatik gösterme
  },
  rol: {
    type: String,
    enum: ['admin', 'musteri'],
    default: 'musteri'
  },
  adSoyad: {
    type: String,
    required: [true, 'Ad soyad zorunludur']
  },
  email: {
    type: String,
    required: [true, 'E-posta zorunludur'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta giriniz']
  },
  telefon: String,
  aktif: {
    type: Boolean,
    default: true
  },
  olusturmaTarihi: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Şifre hashleme middleware (kayıt ve güncelleme sırasında)
userSchema.pre('save', async function(next) {
  // Eğer şifre değiştirilmediyse hash'leme
  if (!this.isModified('sifre')) {
    return next();
  }

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.sifre = await bcrypt.hash(this.sifre, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.sifre);
};

// JSON çıktısında hassas bilgileri gizle
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.sifre;
  return obj;
};

module.exports = mongoose.model('User', userSchema);