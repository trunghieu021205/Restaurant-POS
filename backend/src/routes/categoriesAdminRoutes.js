const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

const { 
    createCategory, 
    getAllCategories, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoriesAdminController');

// Phân quyền cho Admin trên tất cả các route
router.use(authMiddleware, requiredRole(['admin']));

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
