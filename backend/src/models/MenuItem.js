const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    imageUrl: { type: String, default: '' },
    isAvailable: { type: Boolean, required: true, default: true },
    isToday: { type: Boolean, required: true, default: false }
}, { timestamps: true });

MenuItemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);