/**
 * Standart başarılı response formatı
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Başarı mesajı
 * @param {*} data - Response data
 */
const successResponse = (res, statusCode = 200, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standart hata response formatı
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Hata mesajı
 * @param {*} error - Hata detayları (sadece development'ta)
 */
const errorResponse = (res, statusCode = 500, message, error = null) => {
  const response = {
    success: false,
    message
  };

  // Sadece development ortamında hata detaylarını göster
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {Number} page - Sayfa numarası
 * @param {Number} limit - Sayfa başına kayıt sayısı
 * @returns {Object} - Skip ve limit değerleri
 */
const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum
  };
};

/**
 * Pagination response helper
 * @param {Array} data - Veri listesi
 * @param {Number} total - Toplam kayıt sayısı
 * @param {Number} page - Mevcut sayfa
 * @param {Number} limit - Sayfa başına kayıt
 * @returns {Object} - Pagination bilgileriyle birlikte data
 */
const paginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  getPagination,
  paginationResponse
};
