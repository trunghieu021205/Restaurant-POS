const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        note: { type: String }
    }],
    status: { type: String, enum: ['pending', 'cooking', 'done', 'paid', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['cash', 'credit_card', 'e_wallet'], default: 'cash' },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

OrderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;

    if (returnedObject.items && Array.isArray(returnedObject.items)) {
      returnedObject.items = returnedObject.items.map((item) => {
        if (item._id) {
          item.id = item._id.toString();
          delete item._id;
        }
        return item;
      });
    }
  }
});

module.exports = mongoose.model('Order', OrderSchema);