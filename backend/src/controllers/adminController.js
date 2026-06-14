const Order = require('../models/Order');
const Bill = require('../models/Bill');

exports.getStats = async (req, res) => {
    try {
        // 1. Tính tổng doanh thu và số đơn thành công
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
        const paidOrders = revenueResult[0]?.paidBills || 0; // FE đang cần biến paidOrders

        // 2. Tính số đơn hàng đang chờ (Đơn từ Customer/Staff chưa xác nhận/giao)
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // 3. Top món ăn bán chạy nhất
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

        // 4. Dữ liệu biểu đồ (Doanh thu 7 ngày gần nhất)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const chartDataRaw = await Bill.aggregate([
            { 
                $match: { 
                    status: 'paid',
                    updatedAt: { $gte: sevenDaysAgo } 
                } 
            },
            {
                $group: {
                    _id: {
                        dateString: { $dateToString: { format: "%d/%m", date: "$updatedAt", timezone: "+07:00" } },
                        dateValue: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt", timezone: "+07:00" } }
                    },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.dateValue": 1 } }, // Sắp xếp theo ngày tăng dần
            {
                $project: {
                    _id: "$_id.dateString", // FE đang dùng trường _id để hiển thị nhãn "Ngày/Tháng"
                    revenue: 1
                }
            }
        ]);
        
        // Đảm bảo không bị lỗi nếu không có dữ liệu 7 ngày qua
        const chartData = chartDataRaw.length > 0 ? chartDataRaw : [];

        // 5. Nhật ký thanh toán gần đây (Log giao dịch)
        const recentBills = await Bill.find({ status: { $in: ['paid', 'open', 'cancelled'] } })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('tableId', 'name tableNumber'); // Populate để lấy số bàn

        const recentPayments = recentBills.map(bill => {
            // Xử lý lấy tên bàn (đề phòng schema Table dùng field 'name' hoặc 'tableNumber')
            const tNumber = bill.tableId 
                ? (bill.tableId.tableNumber || bill.tableId.name || 'N/A') 
                : 'Mang về';

            return {
                orderId: bill._id.toString(),
                tableNumber: tNumber,
                paymentMethod: bill.paymentMethod || (bill.status === 'paid' ? 'Tiền mặt' : '-'),
                totalAmount: bill.totalAmount || 0,
                status: bill.status
            };
        });

        // 6. Trả về đúng cấu trúc mà Frontend đang chờ đợi
        return res.json({
            totalRevenue,
            paidOrders,
            pendingOrders,
            topItems,
            chartData,
            recentPayments
        });

    } catch (error) {
        console.error('Get stats error:', error);
        return res.status(500).json({ message: 'Không thể tải dữ liệu thống kê' });
    }
};