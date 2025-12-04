const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Config
dotenv.config();

// Models
const Urun = require('./models/Urun');
const Siparis = require('./models/Siparis');
const User = require('./models/User');
const Galeri = require('./models/Galeri');  // ← YENİ

// App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Bağlantısı
const MONGO_URI = "mongodb://127.0.0.1:27017/marangoz_db";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
  }
};

connectDB();

// ==================== AUTH MIDDLEWARE ====================

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Yetkilendirme token\'ı bulunamadı' 
    });
  }

  try {
    const userInfo = JSON.parse(Buffer.from(token, 'base64').toString());
    req.user = userInfo;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Geçersiz token' 
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Bu işlem için admin yetkisi gereklidir' 
    });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// POST - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { kullaniciAdi, sifre } = req.body;

    console.log('Login denemesi:', kullaniciAdi);

    if (!kullaniciAdi || !sifre) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gereklidir'
      });
    }

    const user = await User.findOne({ kullaniciAdi: kullaniciAdi.toLowerCase() });

    if (!user || user.sifre !== sifre) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı'
      });
    }

    if (!user.aktif) {
      return res.status(403).json({
        success: false,
        message: 'Hesabınız pasif durumda'
      });
    }

    const token = Buffer.from(JSON.stringify({
      id: user._id,
      kullaniciAdi: user.kullaniciAdi,
      rol: user.rol,
      adSoyad: user.adSoyad,
      email: user.email
    })).toString('base64');

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        kullaniciAdi: user.kullaniciAdi,
        rol: user.rol,
        adSoyad: user.adSoyad,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş yapılırken bir hata oluştu',
      error: error.message
    });
  }
});

// ==================== ÜRÜN API ROUTES (MAĞAZA) ====================

// GET - Tüm ürünleri getir
app.get('/api/urunler', async (req, res) => {
  try {
    const urunler = await Urun.find().sort({ tarih: -1 });
    
    const formattedUrunler = urunler.map(urun => ({
      ...urun.toObject(),
      id: urun._id,
      documentId: urun._id
    }));

    res.status(200).json(formattedUrunler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Tek bir ürünü getir
app.get('/api/urunler/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Geçersiz ID' });
    }

    const urun = await Urun.findById(id);
    if (!urun) return res.status(404).json({ message: 'Ürün bulunamadı' });

    res.status(200).json({
      ...urun.toObject(),
      id: urun._id,
      documentId: urun._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Yeni ürün ekle (SADECE ADMIN - MAĞAZA)
app.post('/api/urunler', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const yeniUrun = await Urun.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Ürün mağazaya eklendi',
      data: {
        ...yeniUrun.toObject(),
        id: yeniUrun._id
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE - Ürün sil (SADECE ADMIN)
app.delete('/api/urunler/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Geçersiz ID' });
    }

    const silinenUrun = await Urun.findByIdAndDelete(id);
    if (!silinenUrun) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.status(200).json({
      success: true,
      message: 'Ürün silindi'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== GALERİ API ROUTES ====================

// GET - Tüm galeri öğelerini getir
app.get('/api/galeri', async (req, res) => {
  try {
    const galeriOgeleri = await Galeri.find().sort({ tamamlanmaTarihi: -1 });
    res.status(200).json(galeriOgeleri);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Tek bir galeri öğesini getir
app.get('/api/galeri/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Geçersiz ID' });
    }

    const galeriOgesi = await Galeri.findById(id);
    if (!galeriOgesi) {
      return res.status(404).json({ message: 'Galeri öğesi bulunamadı' });
    }

    res.status(200).json(galeriOgesi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Yeni galeri öğesi ekle (SADECE ADMIN - GALERİ)
app.post('/api/galeri', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const yeniGaleriOgesi = await Galeri.create(req.body);
    res.status(201).json({
      success: true,
      message: 'İş galeriye eklendi',
      data: yeniGaleriOgesi
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// DELETE - Galeri öğesi sil (SADECE ADMIN)
app.delete('/api/galeri/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Geçersiz ID' });
    }

    const silinenOge = await Galeri.findByIdAndDelete(id);
    if (!silinenOge) {
      return res.status(404).json({ message: 'Galeri öğesi bulunamadı' });
    }

    res.status(200).json({
      success: true,
      message: 'Galeri öğesi silindi'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SİPARİŞ API ROUTES ====================

// POST - Yeni sipariş oluştur
app.post('/api/siparisler', async (req, res) => {
  try {
    const yeniSiparis = await Siparis.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Sipariş alındı',
      data: yeniSiparis
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ==================== GENEL ROUTES ====================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route bulunamadı'
  });
});

// Server başlat
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});