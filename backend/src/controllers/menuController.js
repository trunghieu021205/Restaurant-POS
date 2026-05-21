const MenuItem = require('../models/MenuItem');

exports.getMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({category: 1, name: 1})
        return res.json(menuItems);
    } catch (error) {
        return res.status(500).json({message: 'Failed to fetch menu'});
    }
};