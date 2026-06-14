const Order = require('../models/Order');
const Table = require('../models/Table');
const TableAuditLog = require('../models/TableAuditLog');
const PaymentNotification = require('../models/PaymentNotification');
const { getIO } = require('../socket');
const { resolveTableByIdentifier } = require('../utils/resolveTable');
const {
    createCashPaymentRequest,
    completePayment,
    buildPaymentPayload
} = require('../services/paymentService');
const {
    getOpenBillForTable,
    refreshBillTotals,
    buildBillResponse
} = require('../services/billService');

const PHONE_PATTERN = /^[0-9+\-\s().]{8,20}$/;

function isValidPhone(phone) {
    return typeof phone === 'string' && PHONE_PATTERN.test(phone.trim());
}

function emitStaff(event, payload) {
    try {
        getIO().to('staff').emit(event, payload);
    } catch (emitError) {
        console.error(`Emit ${event} failed:`, emitError);
    }
}

function emitTable(tableId, event, payload) {
    try {
        getIO().to(`table_${tableId}`).emit(event, payload);
    } catch (emitError) {
        console.error(`Emit ${event} to table ${tableId} failed:`, emitError);
    }
}

async function buildTableStatus(table) {
    const bill = await getOpenBillForTable(table._id);
    const refreshedBill = bill ? await refreshBillTotals(bill._id) : null;

    return {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: refreshedBill?.customerName || table.customerName || '',
        customerPhone: refreshedBill?.customerPhone || table.customerPhone || '',
        checkedInAt: table.checkedInAt,
        reservedAt: table.reservedAt,
        billId: refreshedBill?._id.toString() || null,
        billStatus: refreshedBill?.status || null,
        totalAmount: refreshedBill?.totalAmount || 0,
        updatedAt: table.updatedAt
    };
}

exports.getTableStatuses = async (req, res) => {
    try {
        const tables = await Table.find({}).sort({ number: 1 });
        const result = await Promise.all(tables.map(buildTableStatus));
        return res.json(result);
    } catch (error) {
        console.error('Get table statuses error:', error);
        return res.status(500).json({ message: 'Không thể lấy trạng thái bàn' });
    }
};

exports.reserveTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const customerName = (req.body.customerName || '').trim();
        const customerPhone = (req.body.customerPhone || '').trim();

        if (!customerName || !isValidPhone(customerPhone)) {
            return res.status(400).json({ message: 'Customer name and valid phone are required' });
        }

        const table = await resolveTableByIdentifier(tableId);
        if (!table) return res.status(404).json({ message: 'Table not found' });
        if (table.status === 'occupied') {
            return res.status(409).json({ message: 'Cannot reserve an occupied table' });
        }
        if (table.status === 'maintenance') {
            return res.status(409).json({ message: 'Không thể đặt bàn đang bảo trì' });
        }

        const fromStatus = table.status;
        table.status = 'reserved';
        table.customerName = customerName;
        table.customerPhone = customerPhone;
        table.reservedAt = new Date();
        table.checkedInAt = undefined;
        await table.save();

        await TableAuditLog.create({
            tableId: table._id,
            action: 'reserve',
            fromStatus,
            toStatus: table.status,
            staffId: req.user?.id,
            metadata: { customerName, customerPhone }
        });

        const payload = await buildTableStatus(table);
        emitStaff('table_status_updated', payload);
        return res.json(payload);
    } catch (error) {
        console.error('Reserve table error:', error);
        return res.status(500).json({ message: 'Không thể đặt bàn' });
    }
};

exports.unlockTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { confirmed = false, note = '' } = req.body;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) return res.status(404).json({ message: 'Bàn không tồn tại' });

        if (table.status === 'maintenance') {
            return res.status(409).json({ message: 'Không thể mở khóa bàn đang bảo trì' });
        }

        const openBill = await getOpenBillForTable(table._id);
        if (openBill && !confirmed) {
            return res.status(409).json({ message: 'Hóa đơn mở tồn tại. Yêu cầu xác nhận từ nhân viên.' });
        }

        // Nếu có bill mở, kiểm tra xem có đơn hàng active không
        if (openBill) {
            const activeOrderCount = await Order.countDocuments({
                tableId: table._id,
                billId: openBill._id,
                status: { $ne: 'cancelled' }
            });

            if (activeOrderCount > 0) {
                return res.status(409).json({ 
                    message: 'Không thể mở khóa bàn khi khách đang có đơn hàng chưa thanh toán.' 
                });
            }
        }

        const fromStatus = table.status;
        if (openBill) {
            openBill.customerName = undefined;
            openBill.customerPhone = undefined;
            await openBill.save();
        }

        table.status = 'available';
        table.customerName = undefined;
        table.customerPhone = undefined;
        table.reservedAt = undefined;
        table.checkedInAt = undefined;
        await table.save();

        await TableAuditLog.create({
            tableId: table._id,
            action: 'unlock',
            fromStatus,
            toStatus: table.status,
            staffId: req.user?.id,
            note,
            metadata: { confirmed, openBillId: openBill?._id }
        });

        const payload = await buildTableStatus(table);
        emitStaff('table_status_updated', payload);
        return res.json(payload);
    } catch (error) {
        console.error('Unlock table error:', error);
        return res.status(500).json({ message: 'Không thể mở khóa bàn' });
    }
};

exports.getTableAuditLogs = async (req, res) => {
    try {
        const logs = await TableAuditLog.find({})
            .populate('tableId', 'number')
            .populate('staffId', 'name email')
            .sort({ createdAt: -1 })
            .limit(100);
        return res.json(logs);
    } catch (error) {
        return res.status(500).json({ message: 'Không thể lấy nhật ký kiểm tra' });
    }
};

exports.createPaymentNotification = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { type = 'cash_payment_request', paymentStatus = 'requested' } = req.body;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) return res.status(404).json({ message: 'Bàn không tồn tại' });

        const bill = await getOpenBillForTable(table._id);
        if (!bill) return res.status(400).json({ message: 'Bàn không có hóa đơn mở' });

        const notification = await PaymentNotification.create({
            tableId: table._id,
            billId: bill._id,
            type,
            paymentStatus
        });

        const payload = {
            id: notification._id.toString(),
            tableId: table._id.toString(),
            tableNumber: table.number,
            billId: bill._id.toString(),
            type: notification.type,
            paymentStatus: notification.paymentStatus,
            amount: bill.totalAmount,
            method: type === 'online_qr_payment' ? 'online_qr' : 'cash',
            createdAt: notification.createdAt
        };

        emitStaff('payment_notification', payload);
        emitStaff('payment_notification_detail', payload);
        return res.status(201).json(payload);
    } catch (error) {
        console.error('Create payment notification error:', error);
        return res.status(500).json({ message: 'Không thể tạo thông báo thanh toán' });
    }
};

exports.getPaymentNotifications = async (req, res) => {
    try {
        const notifications = await PaymentNotification.find({})
            .populate('tableId', 'number')
            .populate('billId', 'totalAmount status')
            .populate('paymentId', 'transactionId status method amount createdAt')
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(notifications);
    } catch (error) {
        return res.status(500).json({ message: 'Không thể lấy thông báo thanh toán' });
    }
};

exports.updatePaymentNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        if (!['assisted', 'completed'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
        }

        const notification = await PaymentNotification.findById(id).populate('tableId', 'number');
        if (!notification) return res.status(404).json({ message: 'Thông báo không tồn tại' });

        if (paymentStatus === 'completed') {
            if (notification.type !== 'cash_payment_request') {
                return res.status(400).json({ message: 'Chỉ có yêu cầu thanh toán bằng tiền mặt mới có thể được hoàn thành bởi nhân viên' });
            }
            const table = await Table.findById(notification.tableId._id);
            const bill = await getOpenBillForTable(table._id);
            if (!bill || bill._id.toString() !== notification.billId?.toString()) {
                return res.status(409).json({ message: 'Yêu cầu thanh toán không còn hiệu lực' });
            }
            const result = await completePayment({
                table,
                bill,
                method: 'cash',
                paidBy: req.user?.id,
                notificationId: notification._id,
                note: 'Staff confirmed cash/card-at-counter payment'
            });
            const tableIdStr = table._id.toString();
            emitStaff('payment_notification_updated', result.paymentPayload);
            emitTable(tableIdStr, 'payment_completed', { tableId: tableIdStr, tableNumber: table.number });
            return res.json(result.paymentPayload);
        }

        notification.paymentStatus = paymentStatus;
        notification.assistedBy = req.user?.id;
        if (paymentStatus === 'assisted') notification.assistedAt = new Date();
        if (paymentStatus === 'completed') notification.completedAt = new Date();
        await notification.save();

        await TableAuditLog.create({
            tableId: notification.tableId._id,
            action: 'payment_assist',
            staffId: req.user?.id,
            metadata: { notificationId: notification._id, paymentStatus }
        });

        const bill = notification.billId ? await require('../models/Bill').findById(notification.billId) : null;
        const payload = bill
            ? buildPaymentPayload(notification, notification.tableId, bill)
            : {
                id: notification._id.toString(),
                tableId: notification.tableId._id.toString(),
                tableNumber: notification.tableId.number,
                billId: notification.billId?.toString(),
                type: notification.type,
                paymentStatus: notification.paymentStatus,
                createdAt: notification.createdAt,
                assistedAt: notification.assistedAt,
                completedAt: notification.completedAt
            };
        emitStaff('payment_notification_updated', payload);
        emitStaff('payment_notification_detail', payload);
        return res.json(payload);
    } catch (error) {
        console.error('Update payment notification error:', error);
        return res.status(500).json({ message: 'Không thể cập nhật thông báo thanh toán' });
    }
};

exports.getTableBill = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
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
        return res.status(500).json({ message: 'Không thể lấy hóa đơn của bàn' });
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
        return res.status(500).json({ message: 'Không thể kiểm tra sự tồn tại của bàn' });
    }
};

exports.checkoutTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { paymentMethod = 'cash' } = req.body;
        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
        }

        const bill = await getOpenBillForTable(table._id);
        if (!bill) {
            return res.status(400).json({ message: 'Bàn không có hóa đơn mở để thanh toán' });
        }

        if (paymentMethod === 'cash') {
            const { payload, bill: refreshedBill } = await createCashPaymentRequest({ table, bill });
            return res.status(202).json({
                success: true,
                status: 'payment_requested',
                message: 'Yêu cầu thanh toán đã được gửi đến nhân viên',
                notification: payload,
                bill: await buildBillResponse(refreshedBill, table)
            });
        }

        if (paymentMethod !== 'online_qr') {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
        }

        const result = await completePayment({
            table,
            bill,
            method: 'online_qr',
            paidBy: req.user?.id,
            note: 'Simulated QR payment success'
        });

        return res.json({
            success: true,
            status: 'paid',
            message: 'Hóa đơn đã được thanh toán thành công',
            payment: result.paymentPayload,
            bill: result.bill
        });
    } catch (error) {
        console.error('Checkout table error:', error);
        return res.status(500).json({ message: 'Không thể thanh toán hóa đơn' });
    }
};