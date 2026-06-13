const Order = require('../models/Order'); 

const getAdminStats = async (req, res) => {
    try {
        // 1. Thống kê Tổng doanh thu và số đơn thành công
        const overviewStats = await Order.aggregate([
            { $match: { status: 'paid' } }, 
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }, 
                    paidOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = overviewStats[0]?.totalRevenue || 0;
        const paidOrders = overviewStats[0]?.paidOrders || 0;

        // 2. Thống kê doanh thu theo 7 ngày gần nhất để vẽ biểu đồ
        const chartData = await Order.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 }
        ]);

        // 3. Lấy 10 Nhật ký thanh toán/đơn hàng mới nhất (Payment Logs)
        const recentPayments = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('_id totalAmount paymentMethod status createdAt tableNumber');

        const formattedPayments = recentPayments.map(order => ({
            orderId: order._id,
            totalAmount: order.totalAmount || 0,
            paymentMethod: order.paymentMethod || 'Tiền mặt',
            status: order.status,
            tableNumber: order.tableNumber || 'Mang về',
            time: order.createdAt
        }));

        // 4. Thống kê Top 5 món ăn bán chạy nhất
        const topItems = await Order.aggregate([
            { $match: { status: 'paid' } },
            { $unwind: '$items' }, 
            {
                $group: {
                    _id: '$items.menuItem',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } }, 
            { $limit: 5 }, 
            {
                $lookup: {
                    from: 'menuitems', 
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

        // Trả tập dữ liệu mở rộng về cho Frontend
        res.status(200).json({
            totalRevenue,
            paidOrders,
            chartData,
            recentPayments: formattedPayments,
            topItems
        });
    } catch (error) {
        console.error('Lỗi tính toán thống kê hệ thống:', error);
        res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
    }
};

module.exports = { getAdminStats };