const MenuItem = require('../models/MenuItem');

exports.getMenu = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({categoryId: 1, name: 1})
        
        const formattedMenu = menuItems.reduce((item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image || item.imageUrl || '',
            description: item.description
        }));

        res.json(formattedMenu);
    } catch (error) {
        return res.status(500).json({message: 'Failed to fetch menu'});
    }
};