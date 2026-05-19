const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => { res.json({ message: 'register' }); });
router.post('/login', (req, res) => { res.json({ message: 'login' }); });

module.exports = router;