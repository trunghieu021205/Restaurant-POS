const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');
const {
  getTableQR,
  getAllTableQRs,
  //getPaymentQR,
  checkInTable,
  validateTableSession,
  rejoinTableSession
} = require('../controllers/qrController');

router.get('/table/:tableId', authMiddleware, requiredRole(['admin']), getTableQR);
router.get('/tables', authMiddleware, requiredRole(['admin']), getAllTableQRs);
router.post('/table/:tableId/check-in', checkInTable);
router.post('/table/:tableId/rejoin', rejoinTableSession);
router.post('/table/:tableId/session', validateTableSession);
//router.get('/payment/:billId', getPaymentQR);

module.exports = router;
