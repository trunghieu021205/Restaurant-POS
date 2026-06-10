const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    note: { type: String, default: '' }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    tableId: { type: String, required: true, unique: true },
    items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);