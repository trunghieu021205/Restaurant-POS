const express = require('express')
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const { getMenu } = require('../controllers/menuController')

router.get('/', authMiddleware, getMenu);

module.exports = router;