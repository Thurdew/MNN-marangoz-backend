const Yorum = require('../models/Yorum');
const { validationResult } = require('express-validator');

/**
 * Yorum Controller
 * Müşteri yorumlarını yönetir
 */

// @desc    Yorumları getir
// @route   GET /api/yorumlar
// @access  Public
const getYorumlar = async (req, res) => {
  try {
    const { limit, approved } = req.query;

    // Query oluştur
    let query = {};

    // Onay durumuna göre filtrele
    if (approved !== undefined) {
      query.onaylandi = approved === 'true';
    }

    // Yorumları getir
    let yorumQuery = Yorum.find(query)
      .sort({ tarih: -1, createdAt: -1 });

    // Limit varsa uygula
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        yorumQuery = yorumQuery.limit(limitNum);
      }
    }

    const yorumlar = await yorumQuery;

    res.status(200).json({
      success: true,
      count: yorumlar.length,
      data: yorumlar
    });
  } catch (error) {
    console.error('Yorumlar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yorum istatistiklerini getir
// @route   GET /api/yorumlar/stats
// @access  Public
const getYorumStats = async (req, res) => {
  try {
    const stats = await Yorum.getStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('İstatistikler getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yeni yorum oluştur
// @route   POST /api/yorumlar
// @access  Public
const createYorum = async (req, res) => {
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
      musteriAdi,
      musteriResim,
      yildiz,
      yorum,
      hizmet,
      fotograflar
    } = req.body;

    // Yeni yorum oluştur
    const yeniYorum = await Yorum.create({
      musteriAdi,
      musteriResim,
      yildiz,
      yorum,
      hizmet,
      fotograflar: fotograflar || []
    });

    res.status(201).json({
      success: true,
      message: 'Yorumunuz başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.',
      data: yeniYorum
    });
  } catch (error) {
    console.error('Yorum oluşturulurken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yorumu onayla
// @route   PATCH /api/yorumlar/:id/approve
// @access  Private (Admin only - auth middleware eklenebilir)
const approveYorum = async (req, res) => {
  try {
    const { id } = req.params;

    // Yorumu bul ve onayla
    const yorum = await Yorum.findByIdAndUpdate(
      id,
      { onaylandi: true },
      { new: true, runValidators: true }
    );

    if (!yorum) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla onaylandı',
      data: yorum
    });
  } catch (error) {
    console.error('Yorum onaylanırken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum onaylanırken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Yorumu sil
// @route   DELETE /api/yorumlar/:id
// @access  Private (Admin only - auth middleware eklenebilir)
const deleteYorum = async (req, res) => {
  try {
    const { id } = req.params;

    const yorum = await Yorum.findByIdAndDelete(id);

    if (!yorum) {
      return res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla silindi',
      data: {}
    });
  } catch (error) {
    console.error('Yorum silinirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getYorumlar,
  getYorumStats,
  createYorum,
  approveYorum,
  deleteYorum
};
