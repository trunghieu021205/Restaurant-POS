const express = require('express')
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const requiredRole = require('../middleware/roleMiddleware')
const { createOrder, updateOrderStatus } = require('../controllers/orderController')

router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, requiredRole(['admin']), updateOrderStatus);

module.exports = router;