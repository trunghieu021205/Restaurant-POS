const express = require('express');
const router = express.Router();
const { 
    processPayment, 
    getPayments, 
    createPaymentTransaction, 
    handleVnpayCallback, 
    getTransactionById, 
    getTransactionsByOrder 
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const tableSessionMiddleware = require('../middleware/tableSessionMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, requiredRole(['user']), processPayment);
router.get('/', authMiddleware, requiredRole(['admin']), getPayments);

router.post('/create', tableSessionMiddleware, createPaymentTransaction);
router.get('/callback', handleVnpayCallback);
router.get('/:transactionId', getTransactionById);
router.get('/order/:orderId', tableSessionMiddleware, getTransactionsByOrder);

module.exports = router;