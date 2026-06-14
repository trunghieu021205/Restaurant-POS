const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

// Áp dụng middleware bảo vệ cho TẤT CẢ các route của Admin ở dưới
router.use(authMiddleware, requiredRole(['admin']));

// Thống kê
router.get('/stats', adminController.getStats); // Đã bỏ middleware lặp lại và dùng adminController.getStats

// Quản lý Bàn
router.get('/tables', adminController.getAllTablesAdmin);
router.post('/tables', adminController.createTable);
router.put('/tables/:id', adminController.updateTable);
router.delete('/tables/:id', adminController.deleteTable);

// Quản lý Người dùng (Staff)
router.get('/users', adminController.getAllUsers);
router.post('/users/staff', adminController.createStaff);
router.put('/users/:id/status', adminController.toggleUserStatus); // Khóa/Mở khóa
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;