const Order = require('../models/Order');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    try {
        // 1. Tổng doanh thu + số order đã thanh toán
        const revenueResult = await Order.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    paidOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const paidOrders = revenueResult[0]?.paidOrders || 0;

        // 2. Top 5 món bán chạy nhất
        const topItems = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItemId',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'menuitems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' },
            {
                $project: {
                    _id: 0,
                    menuItemId: '$_id',
                    name: '$menuItem.name',
                    price: '$menuItem.price',
                    totalQuantity: 1,
                    totalSales: 1
                }
            }
        ]);

        // 3. Số đơn hàng chờ xử lý
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        res.json({
            totalRevenue,
            paidOrders,
            pendingOrders,
            topItems
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Lấy thống kê thất bại' });
    }
};