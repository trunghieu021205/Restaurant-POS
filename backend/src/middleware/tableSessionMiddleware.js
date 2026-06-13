const jwt = require('jsonwebtoken');
const Table = require('../models/Table');

const tableSessionMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Thiếu token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if this is a table session token
        if (decoded.purpose === 'table_session') {
            const table = await Table.findById(decoded.tableId);
            if (!table) {
                return res.status(404).json({ message: 'Bàn không tồn tại' });
            }
            
            if (table.status !== 'occupied' || !table.checkedInAt) {
                return res.status(409).json({ message: 'Session bàn không còn hoạt động' });
            }
            
            req.user = { id: decoded.tableId, role: 'customer', tableId: decoded.tableId, tableNumber: decoded.tableNumber };
            req.isTableSession = true;
        } else {
            // Regular auth token
            req.user = { id: decoded.id, role: decoded.role };
            req.isTableSession = false;
        }
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

module.exports = tableSessionMiddleware;
