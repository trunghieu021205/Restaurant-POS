const MenuItem = require('../models/MenuItem');

// GET /api/admin/menu
exports.getAllMenuItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const categoryId = req.query.category || '';
        
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (categoryId && categoryId !== 'all') {
            query.categoryId = categoryId; 
        }

        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            MenuItem.find(query)
                .populate('categoryId')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),
            MenuItem.countDocuments(query)
        ]);

        // .toJSON() is automatically called by res.json() which transforms _id to id
        res.json({
            items: items.map(item => item.toJSON()),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching admin menu:', error);
        return res.status(500).json({ message: 'Failed to fetch menu' });
    }
};

// POST /api/admin/menu
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, description, categoryId, isAvailable, isVisibleToday } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Tên món là bắt buộc' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Tên món phải có ít nhất 2 ký tự' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'Tên món không được quá 100 ký tự' });
    }

    if (!price || price < 1000) {
      return res.status(400).json({ message: 'Giá tối thiểu là 1,000đ' });
    }

    if (price > 99999999) {
      return res.status(400).json({ message: 'Giá không được quá 99,999,999đ' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Mô tả không được quá 500 ký tự' });
    }

    if (!categoryId) {
      return res.status(400).json({ message: 'Vui lòng chọn danh mục' });
    }

    const data = {
      name: name.trim(),
      price,
      description: description ? description.trim() : '',
      categoryId,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVisibleToday: isVisibleToday !== undefined ? isVisibleToday : false
    };

    const item = await MenuItem.create(data);
    res.status(201).json(item.toJSON());
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
};

// PUT /api/admin/menu/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, description, categoryId, isAvailable, isVisibleToday } = req.body;

    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json({ message: 'Tên món không được để trống' });
      }
      if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Tên món phải có ít nhất 2 ký tự' });
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ message: 'Tên món không được quá 100 ký tự' });
      }
    }

    if (price !== undefined) {
      if (price < 1000) {
        return res.status(400).json({ message: 'Giá tối thiểu là 1,000đ' });
      }
      if (price > 99999999) {
        return res.status(400).json({ message: 'Giá không được quá 99,999,999đ' });
      }
    }

    if (description !== undefined && description.length > 500) {
      return res.status(400).json({ message: 'Mô tả không được quá 500 ký tự' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description.trim();
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isVisibleToday !== undefined) updateData.isVisibleToday = isVisibleToday;

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item.toJSON());
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

// DELETE /api/admin/menu/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};
