const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

exports.getCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        let cart = await Cart.findOne({ tableId }).populate('items.menuItemId');
        if (!cart) {
            cart = await Cart.create({ tableId, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { menuItemId, quantity = 1, note = '' } = req.body;

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
            return res.status(400).json({ message: 'Món ăn không tồn tại hoặc đã hết' });
        }

        let cart = await Cart.findOne({ tableId });
        if (!cart) {
            cart = new Cart({ tableId, items: [] });
        }

        // Kiểm tra món ăn đã có trong giỏ hàng chưa
        const existingItemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            if (note) cart.items[existingItemIndex].note = note;
        } else {
            cart.items.push({ menuItemId, quantity, note });
        }

        await cart.save();
        res.json(cart);
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
        res.json(cart);
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