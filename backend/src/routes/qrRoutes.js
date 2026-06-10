const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');
const { getTableQR, getAllTableQRs, getPaymentQR } = require('../controllers/qrController');

// QR Check-in bàn — Chỉ admin/staff mới được tạo QR (để in ra dán bàn)
router.get('/table/:tableId', authMiddleware, requiredRole(['admin']), getTableQR);
router.get('/tables', authMiddleware, requiredRole(['admin']), getAllTableQRs);

// QR thanh toán — Khách tự quét để thanh toán đơn tại bàn
router.get('/payment/:orderId', authMiddleware, requiredRole(['user']), getPaymentQR);

module.exports = router;
