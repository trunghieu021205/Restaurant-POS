const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: { type: Number, default: 1 },
        price: { type: Number }
    }],
    status: { type: String, enum: ['pending', 'preparing', 'served', 'paid'], default: 'pending' },
    totalAmount: { type: Number, default: 0 },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);