const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getTableBill,
    checkoutTable,
    tableExists,
    getTableStatuses,
    reserveTable,
    unlockTable,
    getTableAuditLogs,
    createPaymentNotification,
    getPaymentNotifications,
    updatePaymentNotification
} = require('../controllers/tableController');
const requiredRole = require('../middleware/roleMiddleware');

router.get('/staff/statuses', authMiddleware, requiredRole(['staff', 'admin']), getTableStatuses);
router.get('/staff/audit-logs', authMiddleware, requiredRole(['staff', 'admin']), getTableAuditLogs);
router.get('/staff/payment-notifications', authMiddleware, requiredRole(['staff', 'admin']), getPaymentNotifications);
router.patch('/staff/payment-notifications/:id', authMiddleware, requiredRole(['staff', 'admin']), updatePaymentNotification);

router.get('/:tableId/bill', getTableBill);
router.post('/:tableId/checkout', checkoutTable);
router.post('/:tableId/reserve', authMiddleware, requiredRole(['staff', 'admin']), reserveTable);
router.post('/:tableId/unlock', authMiddleware, requiredRole(['staff', 'admin']), unlockTable);
router.post('/:tableId/payment-notifications', createPaymentNotification);

// GET /api/tables/:tableId/exists
router.get('/:tableId/exists', tableExists);


module.exports = router;
