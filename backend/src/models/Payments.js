const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    amount: { type: Number, required: true },          // Số tiền đã thanh toán (đã có VAT)
    method: { type: String, enum: ['cash', 'credit_card', 'e_wallet'], required: true },
    transactionId: { type: String },                    // Mã giao dịch ngân hàng (nếu có)
    status: { type: String, enum: ['success', 'failed', 'refunded'], default: 'success' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Ai xác nhận thanh toán
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);