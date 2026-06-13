const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const { resolveTableByIdentifier } = require('../utils/resolveTable');

async function resolveTable(tableId) {
    return resolveTableByIdentifier(tableId);
}

const { translateMessage } = require('../utils/errorMessages');

function t(message) {
    return translateMessage(message);
}

exports.getCart = async (req, res) => {

    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: translateMessage('Không có bàn này') });



        const resolvedTableId = table._id;
        let cart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');

        if (!cart) {
            await Cart.create({ tableId: resolvedTableId, items: [] });
            cart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        }


        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: translateMessage('Lỗi khi lấy giỏ hàng') });

    }
};

exports.addToCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: t('Không có bàn này') });

        const resolvedTableId = table._id;
        const { menuItemId, quantity = 1, note = '' } = req.body;



        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                code: 'MENU_ITEM_NOT_FOUND',
                message: 'Món ăn không tồn tại',
            });
        }

        if (!menuItem.isAvailable) {
            return res.status(409).json({
                code: 'MENU_ITEM_UNAVAILABLE',
                message: 'Món này đã hết. Menu sẽ được cập nhật lại.',
            });
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
        res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng' });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { tableId, menuItemId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Không có bàn này' });

        const resolvedTableId = table._id;
        const cart = await Cart.findOne({ tableId: resolvedTableId });

        if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống' });

        cart.items = cart.items.filter(item => item.menuItemId.toString() !== menuItemId);
        await cart.save();

        const populatedCart = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        res.json(populatedCart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Lỗi khi xóa món khỏi giỏ hàng' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Không có bàn này' });

        await Cart.findOneAndUpdate(
            { tableId: table._id },
            { $set: { items: [] } },
            { upsert: true, new: true }
        );

        res.json({ message: 'Đã xóa sạch giỏ hàng' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Lỗi khi xóa toàn bộ giỏ hàng' });
    }
};

exports.updateCartItemNote = async (req, res) => {
    try {
        const { tableId, menuItemId } = req.params;
        const table = await resolveTable(tableId);
        if (!table) return res.status(404).json({ message: 'Không có bàn này' });

        const resolvedTableId = table._id;
        const { note } = req.body;

        const cart = await Cart.findOne({ tableId: resolvedTableId });
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

        const item = cart.items.find(i => i.menuItemId.toString() === menuItemId);
        if (!item) return res.status(404).json({ message: 'Món không có trong giỏ hàng' });

        item.note = note;
        await cart.save();

        const populated = await Cart.findOne({ tableId: resolvedTableId }).populate('items.menuItemId');
        res.json(populated);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật ghi chú' });
    }
};
