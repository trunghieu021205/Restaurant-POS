const MenuItem = require('../models/MenuItem');

// GET /api/menu
exports.getMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({categoryId: 1, name: 1})
        
        const formattedMenu = menuItems.map((item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image || '',
            description: item.description
        }));

        res.json(formattedMenu);
    } catch (error) {
        return res.status(500).json({message: 'Failed to fetch menu'});
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