const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
    transactionCode: { type: String, required: true, unique: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ['online_qr'], required: true },
    paymentGateway: { type: String, enum: ['vnpay'], required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'], default: 'PENDING', index: true },
    paymentUrl: { type: String },
    gatewayTransactionId: { type: String },
    gatewayResponseCode: { type: String },
    gatewayMessage: { type: String },
    paidAt: { type: Date },
    callbackPayload: { type: Object }
}, { timestamps: true });

PaymentTransactionSchema.index(
    { billId: 1, status: 1 },
    { partialFilterExpression: { status: 'PENDING' } }
);

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
