const mongoose = require('mongoose');

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
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
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

module.exports = mongoose.model('User', userSchema);