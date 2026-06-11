const Order = require('../models/Order');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const { getIO } = require('../socket');
const { resolveTableByIdentifier } = require('../utils/resolveTable');
const {
    getOpenBillForTable,
    refreshBillTotals,
    buildBillResponse
} = require('../services/billService');

exports.processPayment = async (req, res) => {
    try {
        const { tableId, paymentMethod = 'cash' } = req.body;

        if (!tableId) {
            return res.status(400).json({ message: 'Missing tableId' });
        }

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
        refreshedBill.paymentMethod = paymentMethod;
        refreshedBill.paidAt = new Date();
        await refreshedBill.save();

        await Table.findByIdAndUpdate(table._id, { status: 'available' });

        try {
            const io = getIO();
            io.to('kitchen').emit('bill_paid', {
                billId: refreshedBill._id,
                tableId: table._id
            });
            io.to(`table_${table._id}`).emit('bill_paid', {
                billId: refreshedBill._id,
                tableId: table._id
            });
        } catch (emitError) {
            console.error('Emit bill_paid failed:', emitError);
        }

        return res.json({
            success: true,
            message: 'Payment successful',
            tableId: table._id,
            bill: await buildBillResponse(refreshedBill, table)
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ message: 'Failed to process payment' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const paidBills = await Bill.find({ status: 'paid' })
            .populate('tableId', 'number')
            .sort({ paidAt: -1, createdAt: -1 });

        return res.json(paidBills);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ message: 'Failed to fetch payments' });
    }
};
