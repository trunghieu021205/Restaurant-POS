const express = require('express')
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const { createOrder, updateOrderStatus } = require('../controllers/orderController')

router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;