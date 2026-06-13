const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/categoriesController');
const authMiddleware = require('../middleware/authMiddleware');
const requiredRole = require('../middleware/roleMiddleware');

// Danh mục có thể xem được bởi khách (isActive: true) và admin (tất cả)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Các route dưới đây chỉ dành cho admin
router.post('/', authMiddleware, requiredRole(['admin']), createCategory);
router.put('/:id', authMiddleware, requiredRole(['admin']), updateCategory);
router.delete('/:id', authMiddleware, requiredRole(['admin']), deleteCategory);

module.exports = router;