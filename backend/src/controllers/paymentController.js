const Order = require('../models/Order');
const Table = require('../models/Table');
const {getIO} = require('../socket');

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