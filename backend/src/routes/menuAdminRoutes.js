const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

const { 
    createMenuItem, 
    getAllMenuItems, 
    updateMenuItem, 
    deleteMenuItem 
} = require('../controllers/menuAdminController');

// Phân quyền cho Admin trên tất cả các route
router.use(authMiddleware, requiredRole(['admin']));

router.get('/', getAllMenuItems);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;
