const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/',authMiddleware, processPayment);

module.exports = router;