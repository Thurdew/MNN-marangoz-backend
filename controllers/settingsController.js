const Settings = require('../models/Settings');
const { validationResult } = require('express-validator');

/**
 * Settings Controller
 * Fiyat ayarlarını yönetir
 */

// @desc    Ayarları getir
// @route   GET /api/ayarlar
// @access  Public
const getSettings = async (req, res) => {
  try {
    // Tek bir settings belgesi getir (yoksa oluştur)
    const settings = await Settings.getSingleSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Ayarlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Ayarları güncelle
// @route   POST /api/ayarlar
// @access  Private (Admin only - auth middleware eklenebilir)
const updateSettings = async (req, res) => {
  try {
    // Validasyon hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const {
      metreFiyat,
      cekmeceUcretsizLimit,
      cekmeceBirimFiyat,
      cnc,
      ayna
    } = req.body;

    // Mevcut ayarları getir (yoksa oluştur)
    let settings = await Settings.getSingleSettings();

    // Güncelleme verilerini hazırla
    const updateData = {};

    if (metreFiyat !== undefined) {
      updateData.metreFiyat = metreFiyat;
    }
    if (cekmeceUcretsizLimit !== undefined) {
      updateData.cekmeceUcretsizLimit = cekmeceUcretsizLimit;
    }
    if (cekmeceBirimFiyat !== undefined) {
      updateData.cekmeceBirimFiyat = cekmeceBirimFiyat;
    }
    if (cnc !== undefined) {
      updateData.cnc = {
        acik: cnc.acik !== undefined ? cnc.acik : settings.cnc.acik,
        fiyat: cnc.fiyat !== undefined ? cnc.fiyat : settings.cnc.fiyat
      };
    }
    if (ayna !== undefined) {
      updateData.ayna = {
        acik: ayna.acik !== undefined ? ayna.acik : settings.ayna.acik,
        fiyat: ayna.fiyat !== undefined ? ayna.fiyat : settings.ayna.fiyat
      };
    }

    // Ayarları güncelle
    const updatedSettings = await Settings.findByIdAndUpdate(
      settings._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Ayarlar güncellenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Ayarlar güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
