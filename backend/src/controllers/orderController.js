const Order = require('../models/Order');
require('../models/Table');
require('../models/MenuItem');
require('../models/User');
const { getIO } = require('../socket');

exports.createOrder = async (req, res) => {
    try {
        const { tableId, items, note } = req.body;
        const resolvedTableId = tableId || req.user?.tableId;

        if (!resolvedTableId) {
            return res.status(400).json({ message: 'Missing tableId' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        const totalAmount = items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);

        const order = await Order.create({
            orderNumber: `ORD-${Date.now()}`,
            tableId: resolvedTableId,
            user: req.user?.id,
            items: items.map((item) => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
                note: item.note
            })),
            status: 'pending',
            subTotal: totalAmount,
            totalAmount
        })

        const populatedOrder = await Order.findById(order._id)
            .populate('tableId')
            .populate('user', 'name email role')
            .populate('items.menuItemId');

        getIO().to('kitchen').emit('new_order', populatedOrder);

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Create order error:', error)
        return res.status(500).json({ message: 'Failed to create order' });
    }
};

