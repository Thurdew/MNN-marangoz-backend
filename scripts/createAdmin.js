const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Environment variables
dotenv.config();

/**
 * İlk Admin Kullanıcısını Oluştur
 *
 * Kullanım: node scripts/createAdmin.js
 */

const createAdmin = async () => {
  try {
    // MongoDB'ye bağlan
    console.log('🔄 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Admin kullanıcısı var mı kontrol et
    const existingAdmin = await User.findOne({ rol: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Zaten bir admin kullanıcısı var:');
      console.log('   Kullanıcı Adı:', existingAdmin.kullaniciAdi);
      console.log('   Ad Soyad:', existingAdmin.adSoyad);
      console.log('   Email:', existingAdmin.email);
      console.log('\n💡 Yeni admin eklemek isterseniz aşağıdaki bilgileri değiştirin.\n');
    }

    // Admin kullanıcısı oluştur (.env dosyasından bilgileri al)
    const adminData = {
      kullaniciAdi: process.env.ADMIN_USERNAME || 'admin',
      sifre: process.env.ADMIN_PASSWORD || 'Admin123!',
      adSoyad: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@mnnmarangoz.com',
      telefon: '5551234567',
      rol: 'admin',
      aktif: true
    };

    console.log('📝 Admin kullanıcısı oluşturuluyor...');
    console.log('   Kullanıcı Adı:', adminData.kullaniciAdi);
    console.log('   Şifre:', '****' + adminData.sifre.slice(-4));
    console.log('   Email:', adminData.email);
    console.log('   Rol:', adminData.rol);
    console.log('');

    const admin = await User.create(adminData);

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!\n');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║           GİRİŞ BİLGİLERİ                         ║');
    console.log('╠═══════════════════════════════════════════════════╣');
    console.log(`║  Kullanıcı Adı: ${adminData.kullaniciAdi.padEnd(34)}║`);
    console.log(`║  Email:         ${adminData.email.padEnd(34)}║`);
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('\n🔐 Şifre .env dosyasında güvenli bir şekilde saklanıyor.\n');

  } catch (error) {
    if (error.code === 11000) {
      console.error('\n❌ HATA: Bu kullanıcı adı veya email zaten kullanımda!');
      console.log('\n💡 Script içindeki adminData değerlerini değiştirip tekrar deneyin.');
    } else {
      console.error('\n❌ HATA:', error.message);
    }
  } finally {
    // MongoDB bağlantısını kapat
    await mongoose.connection.close();
    console.log('\n👋 MongoDB bağlantısı kapatıldı.');
    process.exit();
  }
};

// Script'i çalıştır
createAdmin();
