const Order = require('../models/Order');
const Bill = require('../models/Bill');

exports.getStats = async (req, res) => {
    try {
        const revenueResult = await Bill.aggregate([
            { $match: { status: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    paidBills: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const paidBills = revenueResult[0]?.paidBills || 0;
        const paidBillIds = await Bill.find({ status: 'paid' }).distinct('_id');

        const topItems = await Order.aggregate([
            { $match: { billId: { $in: paidBillIds }, status: { $ne: 'cancelled' } } },
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

        return res.json({
            totalRevenue,
            paidBills,
            paidOrders: paidBills,
        });
        // 3. Số đơn hàng chờ xử lý
        // const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // res.json({
        //     totalRevenue,
        //     paidOrders,
        //     pendingOrders,
        //     topItems
        // });
    } catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({ message: 'Không thể tải dữ liệu thống kê' });
    }
};
