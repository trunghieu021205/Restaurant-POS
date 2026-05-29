const MenuItem = require('../models/MenuItem');

// GET /api/menu
exports.getMenu = async (req, res) => {
    try {
        // Lấy params từ query URL
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const categoryId = req.query.category || ''; // Frontend gửi category
        const status = req.query.status || ''; // 'available' hoặc 'unavailable'
        let query = {};
        // Tìm kiếm theo tên hoặc mô tả
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        // Lọc theo Category
        if (categoryId && categoryId !== 'all') {
            query.categoryId = categoryId; 
        }
        // Lọc theo Trạng thái
        if (status && status !== 'all') {
            query.isAvailable = status === 'available';
        }
        const skip = (page - 1) * limit;
        // Chạy song song lấy data và tổng số lượng
        const [items, total] = await Promise.all([
            MenuItem.find(query)
                .sort({ updatedAt: -1 }) // Trả về món mới nhất trước
                .skip(skip)
                .limit(limit),
            MenuItem.countDocuments(query)
        ]);
        // Cấu trúc response giống hệt Frontend mong muốn
        res.json({
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({ message: 'Failed to fetch menu' });
    }
};

// GET /api/menu/today
exports.getTodayMenu = async (req, res) => {
    try {
        const items = await MenuItem.find({ isToday: true }).sort({name: 1});
        res.json(items);
    } catch (error) {
        console.error('Error fetching today\'s menu:', error);
        return res.status(500).json({message: 'Failed to fetch today\'s menu'});
    }
};

// GET /api/menu/:id
exports.getMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return res.status(500).json({ message: 'Failed to fetch menu item' });
    }
};

// POST /api/menu (admin)
exports.createMenuItem = async (req, res) => {
  try {
    const data = req.body;
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create menu item' });
  }
};

// PUT /api/menu/:id (admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

// DELETE /api/menu/:id (admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};

/*
 PATCH /api/menu/today
 Body options:
  - { "add": ["id1","id2"], "remove": ["id3"] }
  - { "setAll": true }  // mark all items isToday = true
  - { "clearAll": true } // mark all items isToday = false
 Emits menu_updated to 'kitchen' with changed ids.
*/
exports.setTodayMenu = async (req, res) => {
  try {
    const { add = [], remove = [], setAll = false, clearAll = false } = req.body;
    const changed = [];

    if (setAll) {
      await MenuItem.updateMany({}, { isToday: true });
      // collect all ids
      const docs = await MenuItem.find({}, { _id: 1 });
      docs.forEach(d => changed.push(d._id.toString()));
    } else if (clearAll) {
      await MenuItem.updateMany({}, { isToday: false });
      const docs = await MenuItem.find({}, { _id: 1 });
      docs.forEach(d => changed.push(d._id.toString()));
    } else {
      if (add.length) {
        await MenuItem.updateMany({ _id: { $in: add } }, { isToday: true });
        add.forEach(id => changed.push(id));
      }
      if (remove.length) {
        await MenuItem.updateMany({ _id: { $in: remove } }, { isToday: false });
        remove.forEach(id => changed.push(id));
      }
    }

    const payload = { changed, action: setAll ? 'setAll' : clearAll ? 'clearAll' : 'updateToday' };
    try {
      getIO().to('kitchen').emit('menu_updated', payload);
    } catch (error) {
      console.error('Error emitting menu_updated event:', error);
    }

    res.json({ message: 'Today menu updated', payload });
  } catch (err) {
    console.error('setTodayMenu error:', err);
    res.status(500).json({ message: 'Failed to update today menu' });
  }
};
