const Categories = require('../models/Categories');

// GET /api/categories
exports.getCategories = async (req, res) => {
    try {
        const { all } = req.query;
        // Mặc định chỉ lấy danh mục đang active (cho menu của khách)
        // Nếu admin truyền query ?all=true thì lấy tất cả
        const query = all === 'true' ? {} : { isActive: true };

        const categories = await Categories.find(query).sort({ orderIndex: 1, createdAt: -1 });
        res.json(categories);
    } catch (error) {
        console.error('Lỗi lấy danh mục:', error);
        res.status(500).json({ message: 'Không thể lấy danh mục' });
    }
};

// GET /api/categories/:id
// Lấy chi tiết 1 danh mục theo ID
exports.getCategoryById = async (req, res) => {
    try {
        if (!Categories.schema.path('_id') || !req.params.id) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        const category = await Categories.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }
        res.json(category);
    } catch (error) {
        console.error('Lỗi lấy chi tiết danh mục:', error);
        res.status(500).json({ message: 'Không thể lấy chi tiết danh mục' });
    }
};

// POST /api/categories
// Tạo mới 1 danh mục (admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, isActive, orderIndex } = req.body;

        // Kiểm tra bắt buộc: name
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
        }

        // Kiểm tra trùng tên
        const existingCategory = await Categories.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }

        const newCategory = await Categories.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            image: image || '',
            isActive: isActive !== undefined ? isActive : true,
            orderIndex: orderIndex !== undefined ? orderIndex : 0
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Lỗi tạo danh mục:', error);
        res.status(500).json({ message: 'Không thể tạo danh mục' });
    }
};

// PUT /api/categories/:id
// Cập nhật 1 danh mục theo ID (admin)
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Nếu có truyền name thì kiểm tra không được để trống và không trùng với danh mục khác
        if (name) {
            if (name.trim() === '') {
                return res.status(400).json({ message: 'Tên danh mục không được để trống' });
            }
            const existingCategory = await Categories.findOne({ 
                name: name.trim(), _id: { $ne: req.params.id } 
            });
            if (existingCategory) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }
        }

        const updatedCategory = await Categories.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        res.json(updatedCategory);
    } catch (error) {
        console.error('Lỗi cập nhật danh mục:', error);
        res.status(500).json({ message: 'Không thể cập nhật danh mục' });
    }
};

// DELETE /api/categories/:id
// Xóa 1 danh mục theo ID (admin)
exports.deleteCategory = async (req, res) => {
    // Lưu ý: Nếu thực tế có món ăn đang dùng danh mục này thì không nên cho xóa thẳng, 
    // ở đây cứ cho xóa hoặc có thể đổi thành tắt isActive.
    try {
        const deletedCategory = await Categories.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        if (deletedCategory.isActive) {
            // Xử lý logic khi xóa danh mục đang hoạt động
            // Ví dụ: Cập nhật các món ăn đang dùng danh mục này về "Không phân loại" hoặc xóa luôn
            // Ở đây mình sẽ cập nhật các món ăn đang dùng danh mục này về "Không phân loại" (category: null)
            const MenuItem = require('../models/MenuItem');
            await MenuItem.updateMany(
                { categoryId: deletedCategory._id },
                { $set: { categoryId: null } }
            );
            console.log(`Đã cập nhật các món ăn đang dùng danh mục ${deletedCategory.name} về "Không phân loại"`);
        }

        res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        console.error('Lỗi xóa danh mục:', error);
        res.status(500).json({ message: 'Không thể xóa danh mục' });
    }
};