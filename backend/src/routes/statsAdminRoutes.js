const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/statsAdminController');

// Import các middleware bảo mật sẵn có của nhóm bạn
const authMiddleware = require('../middleware/authMiddleware'); 
const roleMiddleware = require('../middleware/roleMiddleware'); 

// Cấu hình endpoint GET /api/admin/stats bảo mật quyền Admin
router.get('/', authMiddleware, roleMiddleware('admin'), getAdminStats);

module.exports = router;