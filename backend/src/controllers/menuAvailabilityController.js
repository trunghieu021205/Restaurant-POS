const MenuItem = require('../models/MenuItem');

// PATCH /api/menu/:id/availability
// Staff/Admin: chỉ cập nhật trạng thái isAvailable (còn/hết)
exports.setMenuAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'isAvailable phải là giá trị kiểu boolean' });
    }

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    ).populate('categoryId');

    if (!updated) {
      return res.status(404).json({ message: 'Món ăn không tồn tại' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('setMenuAvailability error:', error);
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái khả dụng' });
  }
};

