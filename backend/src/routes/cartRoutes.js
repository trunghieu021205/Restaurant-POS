const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');

router.get('/:tableId', authMiddleware, getCart);
router.post('/:tableId/add', authMiddleware, addToCart);
router.delete('/:tableId/remove/:menuItemId', authMiddleware, removeFromCart);
router.delete('/:tableId/clear', authMiddleware, clearCart);

module.exports = router;