const express = require('express')
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {requiredRole} = require('../middleware/roleMiddleware')

const authMiddleware = require('../middleware/authMiddleware')
const { getMenu,
    getTodayMenu,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setTodayMenu
 } = require('../controllers/menuController')

router.get('/', authMiddleware, getMenu);
router.get('/today', authMiddleware, getTodayMenu);
router.get('/:id', authMiddleware, getMenuItem);
router.post('/', authMiddleware, requiredRole('admin'), createMenuItem);
router.put('/:id', authMiddleware, requiredRole('admin'), updateMenuItem);
router.delete('/:id', authMiddleware, requiredRole('admin'), deleteMenuItem);
router.patch('/today', authMiddleware, requiredRole('staff','admin'), setTodayMenu);

module.exports = router;