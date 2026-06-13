const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    status: {
        type: String,
        enum: ['open', 'paid', 'cancelled'],
        default: 'open',
        index: true
    },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    customerName: { type: String, trim: true, index: true },
    customerPhone: { type: String, trim: true, index: true },
    paymentMethod: { type: String, enum: ['cash', 'online_qr'] },
    paidAt: { type: Date }
}, { timestamps: true });

BillSchema.index(
    { tableId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'open' } }
);

module.exports = mongoose.model('Bill', BillSchema);
