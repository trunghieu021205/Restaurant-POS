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
    const data = req.body;
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
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
