const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        note: { type: String }
    }],
    status: { type: String, enum: ['pending', 'confirmed', 'cooking', 'done', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
