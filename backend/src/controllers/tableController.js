const Order = require('../models/Order');
const Table = require('../models/Table');
const { resolveTableByIdentifier } = require('../utils/resolveTable');
const {
    getOpenBillForTable,
    refreshBillTotals,
    buildBillResponse
} = require('../services/billService');

exports.getTableBill = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const bill = await getOpenBillForTable(table._id);
        if (!bill) {
            return res.json({
                id: null,
                tableId: table._id.toString(),
                tableNumber: table.number,
                status: null,
                items: [],
                subtotal: 0,
                tax: 0,
                vatAmount: 0,
                discount: 0,
                totalAmount: 0
            });
        }

        const refreshedBill = await refreshBillTotals(bill._id);
        return res.json(await buildBillResponse(refreshedBill, table));
    } catch (error) {
        console.error('Get table bill error:', error);
        return res.status(500).json({ message: 'Failed to get table bill' });
    }
};

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
        return res.status(500).json({ message: 'Failed to check table' });
    }
};

exports.checkoutTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { paymentMethod = 'cash' } = req.body;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const bill = await getOpenBillForTable(table._id);
        if (!bill) {
            return res.status(400).json({ message: 'Table has no open bill to pay' });
        }

        const activeOrders = await Order.find({ billId: bill._id, status: { $ne: 'cancelled' } });
        if (activeOrders.length === 0) {
            return res.status(400).json({ message: 'Open bill has no orders to pay' });
        }

        const refreshedBill = await refreshBillTotals(bill._id);
        refreshedBill.status = 'paid';
        refreshedBill.paymentMethod = paymentMethod || 'cash';
        refreshedBill.paidAt = new Date();
        await refreshedBill.save();

        await Table.findByIdAndUpdate(table._id, { status: 'available' });

        return res.json({
            success: true,
            message: 'Bill paid successfully',
            bill: await buildBillResponse(refreshedBill, table)
        });
    } catch (error) {
        console.error('Checkout table error:', error);
        return res.status(500).json({ message: 'Failed to checkout bill' });
    }
};
