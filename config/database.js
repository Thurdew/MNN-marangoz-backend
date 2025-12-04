const mongoose = require('mongoose');

/**
 * MongoDB Bağlantısı
 * Mongoose kullanarak MongoDB'ye bağlanır
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB bağlantısı başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    // Production'da hata sonrası process'i sonlandır
    process.exit(1);
  }
};

// Bağlantı olaylarını dinle
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB bağlantısı koptu');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB bağlantı hatası:', err);
});

module.exports = connectDB;
