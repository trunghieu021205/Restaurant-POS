const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

const formatCartItem = (item) => {
    const menuItem = item.menuItemId;
    return {
        id: menuItem._id.toString(),
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image || undefined,
        description: menuItem.description || ''
    };
};

const formatCartResponse = (cart) => ({
    items: cart.items.map(formatCartItem)
});

exports.getCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        let cart = await Cart.findOne({ tableId }).populate('items.menuItemId');
        if (!cart) {
            cart = await Cart.create({ tableId, items: [] });
        }
        res.json(formatCartResponse(cart));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { quantity = 1 } = req.body;
        const menuItemId = req.body.menuItemId || req.body.id;

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
            return res.status(400).json({ message: 'Món ăn không tồn tại hoặc đã hết' });
        }

        let cart = await Cart.findOne({ tableId });
        if (!cart) {
            cart = new Cart({ tableId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ menuItemId, quantity });
        }

        await cart.save();
        await cart.populate('items.menuItemId');
        res.json(formatCartResponse(cart));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { tableId, menuItemId } = req.params;
        let cart = await Cart.findOne({ tableId });
        
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

        cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);
        await cart.save();
        await cart.populate('items.menuItemId');
        res.json(formatCartResponse(cart));
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa món khỏi giỏ hàng' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        await Cart.findOneAndDelete({ tableId });
        res.json({ message: 'Đã dọn sạch giỏ hàng' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa toàn bộ giỏ hàng' });
    }
};