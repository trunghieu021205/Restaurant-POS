const Order = require('../models/Order');
const Table = require('../models/Table');
const {getIO} = require('../socket');
const Payments = require('../models/Payments');

exports.processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Thiếu orderId' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.status === 'paid') {
            return res.status(400).json({ message: 'Đơn hàng đã được thanh toán' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Không thể thanh toán đơn hàng đã hủy' });
        }

        order.status = 'paid';
        order.paymentMethod = paymentMethod || 'cash';
        order.paidAt = new Date();
        await order.save();

        // Tính toán VAT và tổng tiền
        const VAT_RATE = 0.08;
        const subtotal = order.totalAmount || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const vatAmount = Math.round(subtotal * VAT_RATE);
        const totalAmountWithVat = subtotal + vatAmount;
        await Payments.create({
            orderIds: [order._id],
            tableId: order.tableId,
            amount: totalAmountWithVat,
            method: paymentMethod || 'cash',
            paidBy: req.user?.id
        });

        // Cập nhật trạng thái bàn về "available"
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });

        try {
            const io = getIO();
            io.to('kitchen').emit('order_paid', { 
                orderId: order._id, 
                tableId: order.tableId, 
                orderNumber: order.orderNumber 
            });
        } catch (emitError) {
            console.error('Emit order_paid failed:', emitError);
        }

        res.json({
            message: 'Thanh toán thành công',
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                status: order.status,
                paymentMethod: order.paymentMethod,
                paidAt: order.paidAt
            }
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ message: 'Thất bại khi xử lý thanh toán' });
    }
}

// GET /api/payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await Payments.find()
            .populate('tableId', 'number')
            .populate('paidBy', 'name')
            .populate('orderIds', 'orderNumber status')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thanh toán' });
    }
};