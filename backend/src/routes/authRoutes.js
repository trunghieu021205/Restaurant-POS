const express = require('express');
const router = express.Router();
const { register, login, refresh } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');
const { registerStaff } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/register-staff', authMiddleware, requiredRole(['admin']), registerStaff);

module.exports = router;
