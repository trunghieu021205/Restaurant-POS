const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = require('../utils/db');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const { refreshBillTotals } = require('../services/billService');

const ACTIVE_ORDER_STATUSES = ['pending', 'confirmed', 'cooking', 'done'];

async function migrate() {
    await connectDB();

    const activeOrders = await Order.find({
        status: { $in: ACTIVE_ORDER_STATUSES },
        $or: [{ billId: { $exists: false } }, { billId: null }]
    }).sort({ createdAt: 1 });

    const ordersByTable = new Map();
    for (const order of activeOrders) {
        const tableKey = order.tableId.toString();
        if (!ordersByTable.has(tableKey)) {
            ordersByTable.set(tableKey, []);
        }
        ordersByTable.get(tableKey).push(order);
    }

    for (const [tableId, orders] of ordersByTable.entries()) {
        let bill = await Bill.findOne({ tableId, status: 'open' });
        if (!bill) {
            bill = await Bill.create({ tableId, status: 'open' });
        }

        for (const order of orders) {
            order.billId = bill._id;
            await order.save();
        }

        await refreshBillTotals(bill._id);
        await Table.findByIdAndUpdate(tableId, { status: 'occupied' });
        console.log(`Migrated ${orders.length} orders to bill ${bill._id} for table ${tableId}`);
    }

    console.log('Bill migration complete');
    process.exit(0);
}

migrate().catch((error) => {
    console.error('Bill migration failed:', error);
    process.exit(1);
});
