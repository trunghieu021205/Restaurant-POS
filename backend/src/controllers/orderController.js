const { randomUUID } = require('crypto');
const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
require('../models/User');
const { getIO } = require('../socket');

exports.createOrder = async (req, res) => {
    try {
        const { tableId, items, note } = req.body;
        const resolvedTableId = tableId || req.user?.tableId;

        if (!resolvedTableId) {
            return res.status(400).json({ message: 'Missing tableId' });
        }

        const table = await Table.findById(resolvedTableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        const itemIds = items.map((item) => item.menuItemId);
        const menuItems = await MenuItem.find({ _id: { $in: itemIds }, isAvailable: true });
        const menuItemMap = new Map(menuItems.map((menuItem) => [menuItem._id.toString(), menuItem]));

        const orderItems = items.map((item) => {
            if (!item.menuItemId) {
                throw { status: 400, message: 'Each item must include menuItemId' };
            }

            if (!item.quantity || item.quantity < 1) {
                throw { status: 400, message: 'Each item must include a quantity of at least 1' };
            }

            const menuItem = menuItemMap.get(item.menuItemId.toString());
            if (!menuItem) {
                throw { status: 404, message: `Menu item ${item.menuItemId} not found or unavailable` };
            }

            return {
                menuItemId: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price,
                note: item.note
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = await Order.create({
            orderNumber: `ORD-${randomUUID()}`,
            tableId: resolvedTableId,
            user: req.user?.id,
            items: orderItems,
            status: 'pending',
            subTotal: totalAmount,
            totalAmount
        })

        const populatedOrder = await Order.findById(order._id)
            .populate('tableId')
            .populate('user')
            .populate('items.menuItemId');

        const kitchenPayload = {
            orderId: populatedOrder._id,
            orderNumber: populatedOrder.orderNumber,
            table: {
                id: populatedOrder.tableId._id,
                number: populatedOrder.tableId.number
            },
            items: populatedOrder.items.map((item) => ({
                menuItemId: item.menuItemId._id,
                name: item.menuItemId.name,
                quantity: item.quantity,
                note: item.note
            })),
            status: populatedOrder.status,
            createdAt: populatedOrder.createdAt
        };

        getIO().to('kitchen').emit('new_order', kitchenPayload);

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Create order error:', error);
        if (error && error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Failed to create order' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'cooking', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const transition = {pending: ['cooking'], cooking: ['done']};

        if (!transition[order.status]?.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status transition from ${order.status} to ${status}` 
            });
        }

        order.status = status;
        await order.save();

        const payload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            tableId: order.tableId,
            status: order.status,
            updatedAt: order.updatedAt
        }

        getIO().to('kitchen').emit('order_status_updated', payload);
        getIO().to(`table_${order.tableId}`).emit('order_status_updated', payload);

        return res.json({ message: 'Order status updated', order });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({ message: 'Failed to update order status' });
    }
};