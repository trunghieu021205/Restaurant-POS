const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCart, addToCart, removeFromCart, clearCart, updateCartItemNote } = require('../controllers/cartController');

// Khách hàng tại bàn không cần auth
router.get('/:tableId', getCart);
router.post('/:tableId/add', addToCart);
router.delete('/:tableId/remove/:menuItemId', removeFromCart);
router.delete('/:tableId/clear', clearCart);
router.patch('/:tableId/item/:menuItemId/note', updateCartItemNote);

module.exports = router;