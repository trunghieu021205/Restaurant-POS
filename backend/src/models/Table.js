const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true,
        min: 1
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['available', 'occupied'],
        default: 'available'
    }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);