const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  userUpdateValidation,
  changePasswordValidation,
  validateObjectId,
  paginationValidation
} = require('../middleware/validators');

// ==================== KULLANICI PROFİL İŞLEMLERİ ====================

/**
 * @route   GET /api/users/profile
 * @desc    Kullanıcı profilini getir
 * @access  Private
 */
router.get('/profile', protect, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Kullanıcı profilini güncelle
 * @access  Private
 */
router.put('/profile', protect, userUpdateValidation, userController.updateProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Şifre değiştir
 * @access  Private
 */
router.put('/change-password', protect, changePasswordValidation, userController.changePassword);

// ==================== ADMIN KULLANICI YÖNETİMİ ====================

/**
 * @route   GET /api/users
 * @desc    Tüm kullanıcıları getir
 * @access  Private/Admin
 */
router.get('/', protect, adminOnly, paginationValidation, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Tek bir kullanıcıyı getir
 * @access  Private/Admin
 */
router.get('/:id', protect, adminOnly, validateObjectId('id'), userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Kullanıcı bilgilerini güncelle
 * @access  Private/Admin
 */
router.put('/:id', protect, adminOnly, validateObjectId('id'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Kullanıcı sil
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, validateObjectId('id'), userController.deleteUser);

/**
 * @route   PATCH /api/users/:id/toggle-status
 * @desc    Kullanıcı durumunu aktif/pasif yap
 * @access  Private/Admin
 */
router.patch('/:id/toggle-status', protect, adminOnly, validateObjectId('id'), userController.toggleUserStatus);

module.exports = router;
