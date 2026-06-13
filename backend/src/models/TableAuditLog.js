const mongoose = require('mongoose');

const tableAuditLogSchema = new mongoose.Schema({
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    action: {
        type: String,
        enum: ['reserve', 'unlock', 'check_in', 'status_change', 'payment_assist', 'cash_payment_completed', 'online_payment_success'],
        required: true,
        index: true
    },
    fromStatus: { type: String },
    toStatus: { type: String },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffName: { type: String },
    note: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('TableAuditLog', tableAuditLogSchema);
