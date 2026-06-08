const express = require('express');
const router = express.Router();
const { processPayment, getPayments } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

router.post('/',authMiddleware, processPayment);
router.get('/', authMiddleware, requiredRole(['admin']), getPayments);

module.exports = router;