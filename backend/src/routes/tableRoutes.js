const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getTableBill, checkoutTable, tableExists } = require('../controllers/tableController');
const requiredRole = require('../middleware/roleMiddleware');

router.get('/:tableId/bill', getTableBill);
router.post('/:tableId/checkout', checkoutTable);

// GET /api/tables/:tableId/exists
router.get('/:tableId/exists', tableExists);


module.exports = router;
