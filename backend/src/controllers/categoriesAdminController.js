const Categories = require('../models/Categories');
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

const mapId = (doc) => {
    if (!doc) return doc;
    const obj = doc.toObject ? doc.toObject() : doc;
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
};

// GET /api/admin/categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Categories.find().sort({ orderIndex: 1, createdAt: -1 });
        res.json(categories.map(mapId));
    } catch (error) {
        console.error('Lỗi lấy danh mục Admin:', error);
        res.status(500).json({ message: 'Không thể lấy danh mục' });
    }
};

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
    try {
        const { name, description, isActive, orderIndex } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({ message: 'Tên danh mục phải có ít nhất 2 ký tự' });
        }

        if (name.trim().length > 50) {
            return res.status(400).json({ message: 'Tên danh mục không được quá 50 ký tự' });
        }

        if (description && description.length > 200) {
            return res.status(400).json({ message: 'Mô tả không được quá 200 ký tự' });
        }

        if (orderIndex !== undefined && (orderIndex < 0 || orderIndex > 999)) {
            return res.status(400).json({ message: 'Thứ tự hiển thị phải từ 0 đến 999' });
        }

        const existingCategory = await Categories.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const newCategory = await Categories.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            isActive: isActive !== undefined ? isActive : true,
            orderIndex: orderIndex !== undefined ? orderIndex : 0
        });

        res.status(201).json(mapId(newCategory));
    } catch (error) {
        console.error('Lỗi tạo danh mục Admin:', error);
        res.status(500).json({ message: 'Không thể tạo danh mục' });
    }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Danh mục không hợp lệ' });
        }

        const { name, description, isActive, orderIndex } = req.body;

        if (name) {
            if (name.trim() === '') {
                return res.status(400).json({ message: 'Tên danh mục không được để trống' });
            }
            if (name.trim().length < 2) {
                return res.status(400).json({ message: 'Tên danh mục phải có ít nhất 2 ký tự' });
            }
            if (name.trim().length > 50) {
                return res.status(400).json({ message: 'Tên danh mục không được quá 50 ký tự' });
            }
            const existingCategory = await Categories.findOne({ 
                name: name.trim(), _id: { $ne: req.params.id } 
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) {
            if (description.length > 200) {
                return res.status(400).json({ message: 'Mô tả không được quá 200 ký tự' });
            }
            updateData.description = description.trim();
        }
        if (isActive !== undefined) updateData.isActive = isActive;
        if (orderIndex !== undefined) {
            if (orderIndex < 0 || orderIndex > 999) {
                return res.status(400).json({ message: 'Thứ tự hiển thị phải từ 0 đến 999' });
            }
            updateData.orderIndex = orderIndex;
        }

        const updatedCategory = await Categories.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        res.json(mapId(updatedCategory));
    } catch (error) {
        console.error('Lỗi cập nhật danh mục Admin:', error);
        res.status(500).json({ message: 'Không thể cập nhật danh mục' });
    }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Danh mục không hợp lệ' });
        }

        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        await MenuItem.updateMany(
            { categoryId: deletedCategory._id },
            { $set: { categoryId: null } }
        );

        res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        console.error('Lỗi xóa danh mục Admin:', error);
        res.status(500).json({ message: 'Không thể xóa danh mục' });
    }
};
