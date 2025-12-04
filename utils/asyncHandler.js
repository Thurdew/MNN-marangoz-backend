/**
 * Async Handler Wrapper
 * Controller fonksiyonlarındaki try-catch bloklarını otomatikleştirir
 * @param {Function} fn - Async controller fonksiyonu
 * @returns {Function} - Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
