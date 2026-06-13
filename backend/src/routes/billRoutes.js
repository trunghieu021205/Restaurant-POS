const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

const { getPaidBillsTodayForStaff } = require('../controllers/billPaidTodayController');
const { getBillById, getBillReceipt } = require('../controllers/billController');

router.get('/:billId/receipt', getBillReceipt);

// Staff chỉ xem được danh sách bill đã thanh toán thành công trong ngày.
router.get(
  '/staff/paid-today',
  authMiddleware,
  requiredRole(['staff', 'admin']),
  getPaidBillsTodayForStaff,
);

router.get('/:billId', authMiddleware, getBillById);

module.exports = router;

