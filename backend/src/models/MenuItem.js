const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    description: { type: String },
    available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);