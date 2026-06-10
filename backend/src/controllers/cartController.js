const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { resolveTableByIdentifier } = require('../utils/resolveTable');

async function resolveTable(tableId) {
    return resolveTableByIdentifier(tableId);
}

exports.getCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Khong co ban nay' });

        const resolvedTableId = table._id.toString();
        let cart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');

        if (!cart) {
            await Cart.create({ tableId: resolvedTableId, items: [] });
            cart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        }

        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Loi khi lay gio hang' });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Khong co ban nay' });

        const resolvedTableId = table._id.toString();
        const { menuItemId, quantity = 1, note = '' } = req.body;

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem || !menuItem.isAvailable) {
            return res.status(400).json({ message: 'Mon an khong ton tai hoac da het' });
        }

        let cart = await Cart.findOne({ tableId: resolvedTableId });
        if (!cart) {
            cart = new Cart({ tableId: resolvedTableId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.menuItemId.toString() === menuItemId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            if (note) cart.items[existingItemIndex].note = note;
        } else {
            cart.items.push({ menuItemId, quantity, note });
        }

        await cart.save();

        const populatedCart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        res.json(populatedCart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Loi khi them vao gio hang' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { tableId, menuItemId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Khong co ban nay' });

        const resolvedTableId = table._id.toString();
        const cart = await Cart.findOne({ tableId: resolvedTableId });

        if (!cart) return res.status(404).json({ message: 'Gio hang trong' });

        cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);
        await cart.save();

        const populatedCart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        res.json(populatedCart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Loi khi xoa mon khoi gio hang' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Khong co ban nay' });

        const result = await Cart.findOneAndDelete({ tableId: table._id.toString() });
        if (!result) {
            return res.status(404).json({ message: 'Gio hang khong ton tai' });
        }

        res.json({ message: 'Da don sach gio hang' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Loi khi xoa toan bo gio hang' });
    }
};

exports.updateCartItemNote = async (req, res) => {
    try {
        const { tableId, menuItemId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Khong co ban nay' });

        const resolvedTableId = table._id.toString();
        const { note } = req.body;

        const cart = await Cart.findOne({ tableId: resolvedTableId });
        if (!cart) return res.status(404).json({ message: 'Gio hang khong ton tai' });

        const item = cart.items.find(i => i.menuItemId.toString() === menuItemId);
        if (!item) return res.status(404).json({ message: 'Mon khong co trong gio hang' });

        item.note = note;
        await cart.save();

        const populated = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        res.json(populated);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Loi khi cap nhat ghi chu' });
    }
};
