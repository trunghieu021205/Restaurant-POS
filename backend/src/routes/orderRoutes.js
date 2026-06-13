const express = require('express')
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const requiredRole = require('../middleware/roleMiddleware')
const { createOrder, updateOrderStatus, getOrders, getOrdersByTable } = require('../controllers/orderController')

router.post('/', createOrder);
router.get('/table/:tableId', getOrdersByTable);
router.patch('/:id/status', authMiddleware, requiredRole(['admin', 'staff']), updateOrderStatus);
router.get('/', authMiddleware, requiredRole(['admin', 'staff']), getOrders);

module.exports = router;
