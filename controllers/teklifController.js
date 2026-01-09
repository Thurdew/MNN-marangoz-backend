const Teklif = require('../models/Teklif');
const Settings = require('../models/Settings');
const { validationResult } = require('express-validator');

/**
 * Teklif Controller
 * Teklif işlemlerini yönetir
 */

// Fiyat hesaplama fonksiyonu
const hesaplaFiyat = async (teklifData) => {
  try {
    // Ayarları getir
    const settings = await Settings.getSingleSettings();

    const { genislik, yukseklik, derinlik, ekOzellikler, cekmeceAdedi } = teklifData;

    // 1. Temel fiyat hesapla (alan * metreFiyat)
    const alan = genislik * yukseklik * derinlik;
    const temelFiyat = alan * settings.metreFiyat;

    // 2. Malzeme fiyatı (şimdilik 0, ileride malzeme bazlı fiyat eklenebilir)
    const malzemeFiyat = 0;

    // 3. Ek özellikler fiyatı
    let ekOzelliklerFiyat = 0;
    if (ekOzellikler && Array.isArray(ekOzellikler)) {
      ekOzellikler.forEach(ozellik => {
        if (ozellik === 'cnc' && settings.cnc.acik) {
          ekOzelliklerFiyat += settings.cnc.fiyat;
        } else if (ozellik === 'ayna' && settings.ayna.acik) {
          ekOzelliklerFiyat += settings.ayna.fiyat;
        }
      });
    }

    // 4. Çekmece fiyatı (ücretsiz limitten sonraki çekmeceler için)
    let cekmeceFiyat = 0;
    if (cekmeceAdedi > settings.cekmeceUcretsizLimit) {
      const ucretliCekmeceSayisi = cekmeceAdedi - settings.cekmeceUcretsizLimit;
      cekmeceFiyat = ucretliCekmeceSayisi * settings.cekmeceBirimFiyat;
    }

    // 5. Toplam fiyat
    const toplamFiyat = temelFiyat + malzemeFiyat + ekOzelliklerFiyat + cekmeceFiyat;

    return {
      temelFiyat: Math.round(temelFiyat),
      malzemeFiyat: Math.round(malzemeFiyat),
      ekOzelliklerFiyat: Math.round(ekOzelliklerFiyat),
      cekmeceFiyat: Math.round(cekmeceFiyat),
      toplamFiyat: Math.round(toplamFiyat)
    };
  } catch (error) {
    throw new Error('Fiyat hesaplanırken hata oluştu: ' + error.message);
  }
};

// @desc    Teklifleri getir
// @route   GET /api/teklif
// @access  Private (Admin only)
const getTeklifler = async (req, res) => {
  try {
    console.log('📥 GET /api/teklif - Teklifler getiriliyor...');
    console.log('👤 Kullanıcı:', req.user?.email, '| Rol:', req.user?.rol);

    const { limit, durum } = req.query;
    console.log('🔍 Query parametreleri:', { limit, durum });

    // Query oluştur
    let query = {};

    // Duruma göre filtrele
    if (durum) {
      query.durum = durum;
    }

    // Teklifleri getir
    let teklifQuery = Teklif.find(query).sort({ createdAt: -1 });

    // Limit varsa uygula
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        teklifQuery = teklifQuery.limit(limitNum);
      }
    }

    const teklifler = await teklifQuery;
    console.log('✅ Veritabanından çekilen teklif sayısı:', teklifler.length);

    res.status(200).json({
      success: true,
      count: teklifler.length,
      data: teklifler
    });
  } catch (error) {
    console.error('❌ Teklifler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Teklifler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Tek teklif getir
// @route   GET /api/teklif/:id
// @access  Private (Admin only - auth middleware eklenebilir)
const getTeklif = async (req, res) => {
  try {
    const { id } = req.params;

    const teklif = await Teklif.findById(id);

    if (!teklif) {
      return res.status(404).json({
        success: false,
        message: 'Teklif bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: teklif
    });
  } catch (error) {
    console.error('Teklif getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Teklif getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yeni teklif oluştur
// @route   POST /api/teklif
// @access  Public
const createTeklif = async (req, res) => {
  try {
    console.log('📝 POST /api/teklif - Yeni teklif oluşturuluyor...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validasyon hatası:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    let {
      adSoyad,
      email,
      telefon,
      adres,
      hizmet,
      genislik,
      yukseklik,
      derinlik,
      malzeme,
      ekOzellikler,
      cekmeceAdedi,
      notlar
    } = req.body;

    // ============================================
    // VERİ DÖNÜŞÜMLERİ (Frontend formatından DB formatına)
    // ============================================

    // 1. Hizmet adını normalize et
    const hizmetMap = {
      'Mutfak Dolabı': 'mutfak',
      'Mutfak': 'mutfak',
      'Gardirop': 'gardirop',
      'Vestiyer': 'vestiyer',
      'TV Ünitesi': 'tv',
      'TV': 'tv'
    };
    hizmet = hizmetMap[hizmet] || hizmet.toLowerCase();

    // 2. Ölçüleri cm'den metre'ye çevir (frontend cm gönderiyor)
    genislik = parseFloat(genislik) / 100;
    yukseklik = parseFloat(yukseklik) / 100;
    derinlik = parseFloat(derinlik) / 100;

    // 3. Malzemeyi lowercase yap
    malzeme = malzeme.toLowerCase();

    // Fiyatı hesapla
    const fiyatDetay = await hesaplaFiyat({
      genislik,
      yukseklik,
      derinlik,
      ekOzellikler: ekOzellikler || [],
      cekmeceAdedi: cekmeceAdedi || 0
    });

    // Yeni teklif oluştur
    const yeniTeklif = await Teklif.create({
      adSoyad,
      email,
      telefon,
      adres,
      hizmet,
      genislik,
      yukseklik,
      derinlik,
      malzeme,
      ekOzellikler: ekOzellikler || [],
      cekmeceAdedi: cekmeceAdedi || 0,
      fiyatDetay,
      notlar,
      durum: 'beklemede'
    });

    console.log('✅ Teklif başarıyla oluşturuldu:', yeniTeklif._id);
    console.log('💰 Toplam Fiyat:', fiyatDetay.toplamFiyat, 'TL');

    res.status(201).json({
      success: true,
      message: 'Teklif talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: yeniTeklif
    });
  } catch (error) {
    console.error('❌ Teklif oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Teklif oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Teklif durumunu güncelle
// @route   PATCH /api/teklif/:id/status
// @access  Private (Admin only - auth middleware eklenebilir)
const updateTeklifStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    // Geçerli durum kontrolü
    const gecerliDurumlar = ['beklemede', 'inceleniyor', 'teklif-gonderildi', 'onaylandi', 'reddedildi'];
    if (!durum || !gecerliDurumlar.includes(durum)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum değeri. Geçerli değerler: ' + gecerliDurumlar.join(', ')
      });
    }

    // Teklifi bul ve güncelle
    const teklif = await Teklif.findByIdAndUpdate(
      id,
      { durum },
      { new: true, runValidators: true }
    );

    if (!teklif) {
      return res.status(404).json({
        success: false,
        message: 'Teklif bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Teklif durumu başarıyla güncellendi',
      data: teklif
    });
  } catch (error) {
    console.error('Teklif durumu güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Teklif durumu güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Teklifi sil
// @route   DELETE /api/teklif/:id
// @access  Private (Admin only - auth middleware eklenebilir)
const deleteTeklif = async (req, res) => {
  try {
    const { id } = req.params;

    const teklif = await Teklif.findByIdAndDelete(id);

    if (!teklif) {
      return res.status(404).json({
        success: false,
        message: 'Teklif bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Teklif başarıyla silindi',
      data: {}
    });
  } catch (error) {
    console.error('Teklif silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Teklif silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getTeklifler,
  getTeklif,
  createTeklif,
  updateTeklifStatus,
  deleteTeklif
};
