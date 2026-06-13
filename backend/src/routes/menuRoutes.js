const express = require('express')
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const requiredRole = require('../middleware/roleMiddleware')

const { getMenu,
    getTodayMenu,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setTodayMenu
 } = require('../controllers/menuController')

router.get('/', getMenu);
router.get('/today', getTodayMenu); // Khách hàng tại bàn không cần auth
router.get('/:id', authMiddleware, getMenuItem);
router.post('/', authMiddleware, requiredRole(['admin']), createMenuItem);
router.put('/:id', authMiddleware, requiredRole(['admin']), updateMenuItem);
router.delete('/:id', authMiddleware, requiredRole(['admin']), deleteMenuItem);
router.patch('/today', authMiddleware, requiredRole(['admin']), setTodayMenu);
const { setMenuAvailability } = require('../controllers/menuAvailabilityController');

router.patch('/:id/availability', authMiddleware, requiredRole(['staff', 'admin']), setMenuAvailability);

module.exports = router;