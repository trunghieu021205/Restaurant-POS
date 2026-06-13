const mongoose = require('mongoose');

const paymentNotificationSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', index: true },
    type: {
        type: String,
        enum: ['cash_payment_request', 'online_qr_payment'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['requested', 'pending', 'success', 'assisted', 'completed'],
        default: 'requested',
        index: true
    },
    assistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assistedAt: { type: Date },
    completedAt: { type: Date },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, default: 0 },
    method: { type: String, enum: ['cash', 'online_qr'] },
    paidAt: { type: Date },
    transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentNotification', paymentNotificationSchema);
