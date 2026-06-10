const Bill = require('../models/Bill');
const Order = require('../models/Order');

const VAT_RATE = 0.08;

function calculateTotalsFromOrders(orders, discount = 0) {
    const subtotal = orders.reduce((sum, order) => {
        const orderSubtotal = order.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
        return sum + orderSubtotal;
    }, 0);
    const tax = Math.round(subtotal * VAT_RATE);
    const normalizedDiscount = Math.max(0, discount || 0);
    const totalAmount = Math.max(0, subtotal + tax - normalizedDiscount);

    return { subtotal, tax, discount: normalizedDiscount, totalAmount };
}

async function getOpenBillForTable(tableId) {
    return Bill.findOne({ tableId, status: 'open' });
}

async function getOrCreateOpenBill(tableId) {
    const existingBill = await getOpenBillForTable(tableId);
    if (existingBill) return existingBill;

    try {
        return await Bill.create({ tableId, status: 'open' });
    } catch (error) {
        if (error.code === 11000) {
            return getOpenBillForTable(tableId);
        }
        throw error;
    }
}

async function refreshBillTotals(billId) {
    const bill = await Bill.findById(billId);
    if (!bill) return null;

    const orders = await Order.find({ billId: bill._id, status: { $ne: 'cancelled' } });
    const totals = calculateTotalsFromOrders(orders, bill.discount);
    Object.assign(bill, totals);
    await bill.save();
    return bill;
}

async function buildBillResponse(bill, table) {
    const orders = await Order.find({ billId: bill._id })
        .populate('items.menuItemId', 'name price image')
        .sort({ createdAt: 1 });

    const items = [];
    for (const order of orders) {
        for (const item of order.items) {
            items.push({
                id: `${order._id}-${item._id}`,
                orderId: order._id,
                orderNumber: order.orderNumber,
                name: item.menuItemId ? item.menuItemId.name : 'Mon da xoa',
                quantity: item.quantity,
                price: item.price,
                notes: item.note,
                status: order.status
            });
        }
    }

    return {
        id: bill._id.toString(),
        tableId: table._id.toString(),
        tableNumber: table.number,
        status: bill.status,
        items,
        orders,
        subtotal: bill.subtotal,
        tax: bill.tax,
        vatAmount: bill.tax,
        discount: bill.discount,
        totalAmount: bill.totalAmount,
        paymentMethod: bill.paymentMethod,
        paidAt: bill.paidAt,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt
    };
}

module.exports = {
    VAT_RATE,
    calculateTotalsFromOrders,
    getOpenBillForTable,
    getOrCreateOpenBill,
    refreshBillTotals,
    buildBillResponse
};
