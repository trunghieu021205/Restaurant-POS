const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'online_qr'], required: true },
    transactionId: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'success' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
