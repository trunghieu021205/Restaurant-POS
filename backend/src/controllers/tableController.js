const Order = require('../models/Order');
const Table = require('../models/Table');

const VAT_RATE = 0.08; // VAT 8% khớp với Frontend

// GET /api/tables/:tableId/bill
exports.getTableBill = async (req, res) => {
    try {
        const { tableId } = req.params;
        
        // Gom tất cả order CHƯA thanh toán (pending, cooking, done) của bàn này
        const activeOrders = await Order.find({
            tableId,
            status: { $in: ['pending', 'cooking', 'done'] }
        }).populate('items.menuItemId', 'name');

        if (activeOrders.length === 0) {
            return res.json({ tableId, items: [], subtotal: 0, vatAmount: 0, totalAmount: 0 });
        }

        let allItems = [];
        let subtotal = 0;

        // Trích xuất item từ nhiều order gộp lại thành 1 Bill duy nhất
        activeOrders.forEach(order => {
            order.items.forEach(item => {
                allItems.push({
                    name: item.menuItemId ? item.menuItemId.name : 'Món đã xóa',
                    quantity: item.quantity,
                    price: item.price
                });
                subtotal += item.price * item.quantity;
            });
        });

        const vatAmount = Math.round(subtotal * VAT_RATE);
        const totalAmount = subtotal + vatAmount;

        res.json({
            tableId,
            items: allItems,
            subtotal,
            vatAmount,
            totalAmount,
            orderIds: activeOrders.map(o => o._id) // Frontend có thể lưu list này để tra cứu
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy hóa đơn bàn' });
    }
};

// POST /api/tables/:tableId/checkout
exports.checkoutTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { paymentMethod = 'cash' } = req.body;

        const activeOrders = await Order.find({
            tableId,
            status: { $in: ['pending', 'cooking', 'done'] }
        });

        if (activeOrders.length === 0) {
            return res.status(400).json({ message: 'Bàn không có đơn hàng nào cần thanh toán' });
        }

        // Đổi trạng thái tất cả order của bàn này thành "paid"
        for (let order of activeOrders) {
            order.status = 'paid';
            order.paymentMethod = paymentMethod;
            order.paidAt = new Date();
            await order.save();
        }

        // Chuyển bàn thành trống (available)
        await Table.findByIdAndUpdate(tableId, { status: 'available' });

        res.json({ success: true, message: 'Thanh toán thành công toàn bộ bàn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thanh toán bàn' });
    }
};