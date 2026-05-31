const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');
const { getStats } = require('../controllers/adminController');

router.get('/stats', authMiddleware, requiredRole(['admin']), getStats);

module.exports = router;