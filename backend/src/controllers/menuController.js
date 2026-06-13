const MenuItem = require('../models/MenuItem');
const { getIO } = require('../socket');

// GET /api/menu
exports.getMenu = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categoryId = req.query.category || ''; // Frontend gửi category
    const status = req.query.status || ''; // 'available' hoặc 'unavailable'

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      query.categoryId = categoryId;
    }

    if (status && status !== 'all') {
      query.isAvailable = status === 'available';
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(query)
        .populate('categoryId')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      MenuItem.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách món ăn' });
  }
};

// GET /api/menu/today
exports.getTodayMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ isVisibleToday: true })
      .populate('categoryId')
      .sort({ name: 1 });

    res.json(items);
  } catch (error) {
    console.error("Error fetching today's menu:", error);
    return res.status(500).json({ message: "Không thể tải danh sách món ăn hôm nay" });
  }
};

// GET /api/menu/:id
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('categoryId');

    if (!item) {
      return res.status(404).json({ message: 'Món ăn không tồn tại' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return res.status(500).json({ message: 'Không thể tải thông tin món ăn' });
  }
};

// POST /api/menu (admin)
exports.createMenuItem = async (req, res) => {
  try {
    const data = req.body;
    const item = await MenuItem.create(data);
    const populatedItem = await MenuItem.findById(item._id).populate('categoryId');
    res.status(201).json(populatedItem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Không thể tạo món ăn mới' });
  }
};

// PUT /api/menu/:id (admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('categoryId');

    if (!item) return res.status(404).json({ message: 'Món ăn không tồn tại' });

    res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Không thể cập nhật thông tin món ăn' });
  }
};

// DELETE /api/menu/:id (admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) return res.status(404).json({ message: 'Món ăn không tồn tại' });

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Không thể xóa món ăn' });
  }
};

/*
 PATCH /api/menu/today
 Admin - toggle isVisibleToday
 Body options:
  - { "add": ["id1","id2"], "remove": ["id3"] }
  - { "setAll": true }
  - { "clearAll": true }
 Emits menu_updated to 'kitchen' with changed ids.
*/
exports.setTodayMenu = async (req, res) => {
  try {
    const { add = [], remove = [], setAll = false, clearAll = false } = req.body;
    const changed = [];

    if (setAll) {
      await MenuItem.updateMany({}, { isVisibleToday: true });
      const docs = await MenuItem.find({}, { _id: 1 });
      docs.forEach((d) => changed.push(d._id.toString()));
    } else if (clearAll) {
      await MenuItem.updateMany({}, { isVisibleToday: false });
      const docs = await MenuItem.find({}, { _id: 1 });
      docs.forEach((d) => changed.push(d._id.toString()));
    } else {
      if (add.length) {
        await MenuItem.updateMany({ _id: { $in: add } }, { isVisibleToday: true });
        add.forEach((id) => changed.push(id));
      }
      if (remove.length) {
        await MenuItem.updateMany({ _id: { $in: remove } }, { isVisibleToday: false });
        remove.forEach((id) => changed.push(id));
      }
    }

    const payload = { changed, action: setAll ? 'setAll' : clearAll ? 'clearAll' : 'updateToday' };

    let socketEmitted = false;
    let socketError = null;

    try {
      getIO().to('kitchen').emit('menu_updated', payload);
      socketEmitted = true;
    } catch (error) {
      console.error('Error emitting menu_updated event:', error);
      socketError = error;
    }

    res.json({
      message: 'Today menu updated',
      payload,
      socketEmitted,
      socketError: socketError ? socketError.toString() : undefined,
    });
  } catch (err) {
    console.error('setTodayMenu error:', err);
    return res.status(500).json({ message: 'Không thể cập nhật danh sách món ăn hôm nay' });
  }
};

