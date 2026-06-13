const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number: {
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
        enum: ['available', 'occupied', 'reserved' , 'maintenance'],
        default: 'available'
    },
    customerName: {
        type: String,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true,
        index: true
    },
    reservedAt: {
        type: Date
    },
    checkedInAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
