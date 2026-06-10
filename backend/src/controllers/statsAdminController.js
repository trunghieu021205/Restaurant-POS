const Order = require('../models/Order'); // Đảm bảo đúng đường dẫn tới file Model Order của nhóm bạn

const getAdminStats = async (req, res) => {
    try {
        // 1. Thống kê tổng doanh thu và số đơn hàng đã thành công (status: 'paid')
        const overviewStats = await Order.aggregate([
            { $match: { status: 'paid' } }, 
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }, // Nếu nhóm bạn đặt tên trường là 'total' thì sửa thành $total
                    paidOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = overviewStats[0]?.totalRevenue || 0;
        const paidOrders = overviewStats[0]?.paidOrders || 0;

        // 2. Thống kê Top 5 món ăn bán chạy nhất bằng kỹ thuật kết mảng (Lookup)
        const topItems = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $unwind: '$items' }, // Bóc tách mảng món ăn bên trong đơn hàng
            {
                $group: {
                    _id: '$items.menuItem',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } }, // Sắp xếp giảm dần theo số lượng bán được
            { $limit: 5 }, // Lấy ra đúng 5 món đứng đầu
            {
                $lookup: {
                    from: 'menuitems', // Tên collection chứa món ăn trong MongoDB
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuInfo'
                }
            },
            { $unwind: { path: '$menuInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    menuItemId: '$_id',
                    name: { $ifNull: ['$menuInfo.name', 'Món ăn đã bị xóa'] },
                    price: { $ifNull: ['$menuInfo.price', 0] },
                    totalQuantity: 1,
                    totalSales: 1
                }
            }
        ]);

        // Trả kết quả JSON chuẩn cấu hình sang cho Frontend nhận diện
        res.status(200).json({
            totalRevenue,
            paidOrders,
            topItems
        });
    } catch (error) {
        console.error('Lỗi tính toán thống kê hệ thống:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
    }
};

module.exports = { getAdminStats };