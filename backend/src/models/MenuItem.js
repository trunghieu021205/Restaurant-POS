const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    isAvailable: { type: Boolean, required: true, default: true },
    isToday: { type: Boolean, required: true, default: false }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);