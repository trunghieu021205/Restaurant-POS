const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getTableBill, checkoutTable } = require('../controllers/tableController');
const requiredRole = require('../middleware/roleMiddleware');

router.get('/:tableId/bill', authMiddleware, requiredRole(['admin', 'staff']), getTableBill);
router.post('/:tableId/checkout', authMiddleware, requiredRole(['admin', 'staff']), checkoutTable);

module.exports = router;