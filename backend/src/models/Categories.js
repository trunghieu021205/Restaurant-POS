const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        unique: true // Tên danh mục không được trùng nhau (VD: không thể có 2 danh mục "Đồ uống")
    },
    description: { 
        type: String,
        trim: true,
        default: ''
    },
    isActive: { 
        type: Boolean, 
        default: true // Để ẩn/hiện danh mục trên menu mà không cần xóa database
    },
    orderIndex: { 
        type: Number, 
        default: 0 // Dùng để sắp xếp danh mục nào hiện trước, danh mục nào hiện sau trên Frontend
    }
}, { timestamps: true });

CategoriesSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Categories', CategoriesSchema);