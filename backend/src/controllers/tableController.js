const Order = require('../models/Order');
const Table = require('../models/Table');
const Payments = require('../models/Payments');
const { resolveTableByIdentifier } = require('../utils/resolveTable');

const VAT_RATE = 0.08; // VAT 8% khớp với Frontend

// GET /api/tables/:tableId/bill
exports.getTableBill = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Khong co ban nay' });
        }
        const resolvedTableId = table._id;
        
        // Gom tất cả order CHƯA thanh toán (pending, cooking, done) của bàn này
        const activeOrders = await Order.find({
            tableId: resolvedTableId,
            status: { $in: ['pending', 'cooking', 'done'] }
        }).populate('items.menuItemId', 'name');

        if (activeOrders.length === 0) {
            return res.json({ tableId: table._id.toString(), tableNumber: table.number, items: [], subtotal: 0, vatAmount: 0, totalAmount: 0 });
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
            tableId: table._id.toString(),
            tableNumber: table.number,
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

// GET /api/tables/:tableId/exists
exports.tableExists = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTableByIdentifier(tableId);
        return res.json({
            exists: !!table,
            table: table ? {
                id: table._id.toString(),
                number: table.number,
                capacity: table.capacity,
                status: table.status
            } : null
        });
    } catch (error) {
        console.error('Error checking table exists:', error);
        return res.status(500).json({ message: 'Lỗi khi kiểm tra bàn' });
    }
};

// POST /api/tables/:tableId/checkout
exports.checkoutTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { paymentMethod = 'cash' } = req.body;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Khong co ban nay' });
        }

        const activeOrders = await Order.find({
            tableId: table._id,
            status: { $in: ['pending', 'cooking', 'done'] }
        });

        if (activeOrders.length === 0) {
            return res.status(400).json({ message: 'Bàn không có đơn hàng nào cần thanh toán' });
        }

        let tableSubtotal = 0;
        let orderIds = [];
        // Đổi trạng thái tất cả order của bàn này thành "paid"
        for (let order of activeOrders) {
            order.status = 'paid';
            order.paymentMethod = paymentMethod;
            order.paidAt = new Date();
            await order.save();
            
            const orderSubtotal = order.totalAmount || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            tableSubtotal += orderSubtotal;
            orderIds.push(order._id);
        }
        const tableVatAmount = Math.round(tableSubtotal * VAT_RATE);
        const tableTotalAmountWithVat = tableSubtotal + tableVatAmount;

        // Lưu thông tin thanh toán vào collection Payments
        await Payments.create({
            orderIds: orderIds,
            tableId: table._id,
            amount: tableTotalAmountWithVat,
            method: paymentMethod || 'cash',
            paidBy: req.user?.id
        });

        // Chuyển bàn thành trống (available)
        await Table.findByIdAndUpdate(table._id, { status: 'available' });

        res.json({ success: true, message: 'Thanh toán thành công toàn bộ bàn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thanh toán bàn' });
    }
};
