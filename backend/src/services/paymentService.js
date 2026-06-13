const crypto = require('crypto');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Payment = require('../models/Payments');
const PaymentTransaction = require('../models/PaymentTransaction');
const PaymentNotification = require('../models/PaymentNotification');
const TableAuditLog = require('../models/TableAuditLog');
const { getIO } = require('../socket');
const { createPaymentUrl, verifyCallback } = require('./vnpayService');
const {
    refreshBillTotals,
    buildBillResponse
} = require('./billService');
const util = require('util');

function emitStaff(event, payload) {
    try {
        getIO().to('staff').emit(event, payload);
    } catch (emitError) {
        console.error(`Emit ${event} failed:`, emitError);
    }
}

function emitBillPaid(tableId, billId) {
    try {
        const io = getIO();
        io.to('kitchen').emit('bill_paid', { billId, tableId });
        io.to(`table_${tableId}`).emit('bill_paid', { billId, tableId });
    } catch (emitError) {
        console.error('Emit bill_paid failed:', emitError);
    }
}

function buildPaymentPayload(notification, table, bill, payment) {
    return {
        id: notification._id.toString(),
        tableId: table._id.toString(),
        tableNumber: table.number,
        billId: bill._id.toString(),
        billCode: bill._id.toString().slice(-8).toUpperCase(),
        type: notification.type,
        paymentStatus: notification.paymentStatus,
        amount: notification.amount ?? bill.totalAmount,
        method: notification.method,
        paymentId: payment?._id?.toString() || notification.paymentId?.toString(),
        transactionId: notification.transactionId,
        paidAt: notification.paidAt,
        createdAt: notification.createdAt,
        assistedAt: notification.assistedAt,
        completedAt: notification.completedAt
    };
}

async function assertBillPayable(billId) {
    const bill = await refreshBillTotals(billId);
    if (!bill) {
        const error = new Error('Bill not found');
        error.statusCode = 404;
        throw error;
    }

    if (bill.status !== 'open') {
        const error = new Error('Bill is not open');
        error.statusCode = 400;
        throw error;
    }

    const activeOrders = await Order.find({ billId: bill._id, status: { $ne: 'cancelled' } });
    if (activeOrders.length === 0) {
        const error = new Error('Open bill has no orders to pay');
        error.statusCode = 400;
        throw error;
    }

    return bill;
}

async function createCashPaymentRequest({ table, bill }) {
    const refreshedBill = await assertBillPayable(bill._id);
    let notification = await PaymentNotification.findOne({
        billId: refreshedBill._id,
        type: 'cash_payment_request',
        paymentStatus: { $in: ['requested', 'assisted'] }
    }).sort({ createdAt: -1 });

    if (!notification) {
        notification = await PaymentNotification.create({
            tableId: table._id,
            billId: refreshedBill._id,
            type: 'cash_payment_request',
            paymentStatus: 'requested',
            amount: refreshedBill.totalAmount,
            method: 'cash'
        });
    } else {
        notification.amount = refreshedBill.totalAmount;
        notification.method = 'cash';
        await notification.save();
    }

    const payload = buildPaymentPayload(notification, table, refreshedBill);
    emitStaff('payment_notification', payload);
    emitStaff('payment_notification_detail', payload);
    return { notification, payload, bill: refreshedBill };
}

async function completePayment({ table, bill, method, paidBy, notificationId, note }) {
    const refreshedBill = await assertBillPayable(bill._id);
    const existingPayment = await Payment.findOne({ billId: refreshedBill._id, status: 'success' });
    if (existingPayment) {
        const error = new Error('Bill already has a successful payment');
        error.statusCode = 409;
        throw error;
    }

    const paidAt = new Date();
    const transactionId = `${method.toUpperCase()}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const amount = typeof refreshedBill.totalAmount === 'number'
        ? refreshedBill.totalAmount
        : Number(refreshedBill.totalAmount) || 0;

    const payment = await Payment.create({
        billId: refreshedBill._id,
        tableId: table._id,
        amount,
        method,
        transactionId,
        status: 'success',
        paidBy,
        note
    });

    refreshedBill.status = 'paid';
    refreshedBill.paymentMethod = method;
    refreshedBill.paidAt = paidAt;
    await refreshedBill.save();

    table.status = 'available';
    table.customerName = undefined;
    table.customerPhone = undefined;
    table.reservedAt = undefined;
    table.checkedInAt = undefined;
    await table.save();

    const notificationPaymentStatus = method === 'online_qr' ? 'success' : 'completed';
    const notificationType = method === 'online_qr' ? 'online_qr_payment' : 'cash_payment_request';

    let notification = notificationId
        ? await PaymentNotification.findById(notificationId)
        : null;

    if (!notification) {
        // FIX: include all required fields on create to satisfy MongoDB jsonSchema validation
        notification = await PaymentNotification.create({
            tableId: table._id,
            billId: refreshedBill._id,
            type: notificationType,
            paymentStatus: notificationPaymentStatus,
            amount,
            method,
            paymentId: payment._id,
            paidAt,
            completedAt: paidAt,
            transactionId,
            ...(paidBy && { assistedBy: paidBy })
        });
    } else {
        notification.paymentStatus = notificationPaymentStatus;
        notification.amount = amount;
        notification.method = method;
        notification.paymentId = payment._id;
        notification.paidAt = paidAt;
        notification.completedAt = paidAt;
        notification.transactionId = transactionId;
        if (paidBy) notification.assistedBy = paidBy;
        await notification.save();
    }

    await TableAuditLog.create({
        tableId: table._id,
        action: method === 'online_qr' ? 'online_payment_success' : 'cash_payment_completed',
        fromStatus: 'occupied',
        toStatus: table.status,
        staffId: paidBy,
        note,
        metadata: { billId: refreshedBill._id, paymentId: payment._id, notificationId: notification._id }
    });

    const paymentPayload = buildPaymentPayload(notification, table, refreshedBill, payment);
    emitStaff('payment_notification', paymentPayload);
    emitStaff('payment_notification_updated', paymentPayload);
    emitStaff('payment_notification_detail', paymentPayload);
    emitStaff('table_status_updated', {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: '',
        customerPhone: '',
        checkedInAt: table.checkedInAt,
        reservedAt: table.reservedAt,
        billId: null,
        billStatus: refreshedBill.status,
        totalAmount: 0,
        updatedAt: table.updatedAt
    });
    emitBillPaid(table._id, refreshedBill._id);

    return {
        payment,
        notification,
        paymentPayload,
        bill: await buildBillResponse(refreshedBill, table)
    };
}

function createTransactionCode() {
    return `VNP${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function createOnlinePaymentTransaction({ orderId, ipAddress }) {
    if (!orderId) {
        const error = new Error('orderId is required');
        error.statusCode = 400;
        throw error;
    }

    const order = await Order.findById(orderId);
    if (!order) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    const table = await Table.findById(order.tableId);
    if (!table) {
        const error = new Error('Table not found');
        error.statusCode = 404;
        throw error;
    }

    const bill = await assertBillPayable(order.billId);
    if (bill._id.toString() !== order.billId.toString()) {
        const error = new Error('Order does not belong to the payable bill');
        error.statusCode = 400;
        throw error;
    }

    const successfulPayment = await Payment.findOne({ billId: bill._id, status: 'success' });
    if (successfulPayment) {
        const error = new Error('Bill has already been paid');
        error.statusCode = 409;
        throw error;
    }

    const existingPending = await PaymentTransaction.findOne({
        billId: bill._id,
        status: 'PENDING',
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (existingPending?.paymentUrl) {
        return { transaction: existingPending, paymentUrl: existingPending.paymentUrl };
    }

    const transactionCode = createTransactionCode();
    const paymentUrl = createPaymentUrl({
        transactionCode,
        amount: bill.totalAmount,
        ipAddress,
        orderInfo: `Thanh toan hoa don ${bill._id.toString()}`
    });

    const transaction = await PaymentTransaction.create({
        transactionCode,
        orderId: order._id,
        billId: bill._id,
        tableId: table._id,
        amount: bill.totalAmount,
        paymentMethod: 'online_qr',
        paymentGateway: 'vnpay',
        status: 'PENDING',
        paymentUrl
    });

    return { transaction, paymentUrl };
}

async function handleVnpayCallback(query) {
    try {
        console.log('VNPay callback query:', JSON.stringify(query, null, 2));
    const isValidSignature = verifyCallback(query);
    const transactionCode = query.vnp_TxnRef;
    const responseCode = query.vnp_ResponseCode;
    const transactionStatus = query.vnp_TransactionStatus;

    if (!isValidSignature) {
        const error = new Error('Invalid VNPay signature');
        error.statusCode = 400;
        throw error;
    }

    const transaction = await PaymentTransaction.findOne({ transactionCode });
    if (!transaction) {
        const error = new Error('Payment transaction not found');
        error.statusCode = 404;
        throw error;
    }

    if (transaction.status !== 'PENDING') {
        return { transaction, alreadyProcessed: true };
    }

    transaction.gatewayTransactionId = query.vnp_TransactionNo;
    transaction.gatewayResponseCode = responseCode;
    const safePayload = {};
    for (const [key, value] of Object.entries(query)) {
        if (key.startsWith('vnp_')) {
            safePayload[key] = String(value); // ép string để tránh type mismatch
        }
    }
    transaction.callbackPayload = safePayload;

    if (responseCode !== '00' || transactionStatus !== '00') {
        transaction.status = 'FAILED';
        transaction.gatewayMessage = query.vnp_Message || 'VNPay rejected the transaction';
        await transaction.save();
        return { transaction, alreadyProcessed: false };
    }

    const bill = await refreshBillTotals(transaction.billId);
    if (!bill || bill.status !== 'open') {
        transaction.status = 'FAILED';
        transaction.gatewayMessage = 'Bill is no longer payable';
        await transaction.save();
        return { transaction, alreadyProcessed: false };
    }

    if (Math.round(bill.totalAmount) !== Math.round(transaction.amount)) {
        transaction.status = 'FAILED';
        transaction.gatewayMessage = 'Payment amount does not match bill total';
        await transaction.save();
        return { transaction, alreadyProcessed: false };
    }

    const table = await Table.findById(transaction.tableId);
    const result = await completePayment({
        table,
        bill,
        method: 'online_qr',
        note: `VNPay transaction ${query.vnp_TransactionNo || transactionCode}`
    });

    transaction.status = 'SUCCESS';
    transaction.paidAt = result.payment.paidAt || new Date();
    transaction.gatewayMessage = 'Payment successful';
    try {
        await transaction.save();
    } catch (saveError) {
        console.error('Save failed - full errInfo:', JSON.stringify(saveError.errInfo, null, 2));
        console.error('Transaction state at save:', JSON.stringify(transaction.toObject(), null, 2));
        console.error('Validation details DEEP:', util.inspect(error.errInfo?.details, { depth: null }));
        throw saveError;
    }

    return { transaction, alreadyProcessed: false, payment: result.paymentPayload, bill: result.bill };
    } catch (error) {
        const util = require('util');
        console.error('DEEP ERROR:', util.inspect(error, { depth: null })); // ← thêm dòng này
    }
    
}

module.exports = {
    createCashPaymentRequest,
    completePayment,
    createOnlinePaymentTransaction,
    handleVnpayCallback,
    buildPaymentPayload,
    assertBillPayable
};