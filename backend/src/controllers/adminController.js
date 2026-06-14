const Order = require('../models/Order');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Table = require('../models/Table');
const bcrypt = require('bcryptjs');

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
        const paidOrders = revenueResult[0]?.paidBills || 0;

        // 2. Tính số đơn hàng đang chờ
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
            { $sort: { "_id.dateValue": 1 } },
            {
                $project: {
                    _id: "$_id.dateString",
                    revenue: 1
                }
            }
        ]);
        
        const chartData = chartDataRaw.length > 0 ? chartDataRaw : [];

        // 5. Nhật ký thanh toán gần đây (Log giao dịch)
        const recentBills = await Bill.find({ status: { $in: ['paid', 'open', 'cancelled'] } })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('tableId', 'number'); // Cập nhật đúng trường 'number' từ Table Schema

        const recentPayments = recentBills.map(bill => {
            // Lấy trực tiếp trường 'number' thay vì 'tableNumber'
            const tNumber = bill.tableId && bill.tableId.number
                ? bill.tableId.number 
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
exports.getAllTablesAdmin = async (req, res) => {
    try {
        const tables = await Table.find().sort({ number: 1 });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bàn', error: error.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const { number, capacity } = req.body;
        const existingTable = await Table.findOne({ number });
        if (existingTable) return res.status(400).json({ message: 'Số bàn này đã tồn tại' });

        const table = await Table.create({ number, capacity });
        res.status(201).json({ message: 'Thêm bàn thành công', table });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo bàn', error: error.message });
    }
};

exports.updateTable = async (req, res) => {
    try {
        const { capacity, status } = req.body;
        const table = await Table.findByIdAndUpdate(
            req.params.id, 
            { capacity, status }, 
            { new: true }
        );
        if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });
        res.json({ message: 'Cập nhật bàn thành công', table });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật bàn', error: error.message });
    }
};

exports.deleteTable = async (req, res) => {
    try {
        // Có thể cần check xem bàn có đơn hàng nào chưa thanh toán không trước khi xóa
        const table = await Table.findByIdAndDelete(req.params.id);
        if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' });
        res.json({ message: 'Xóa bàn thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bàn', error: error.message });
    }
};

// ==========================================
// QUẢN LÝ NGƯỜI DÙNG / STAFF
// ==========================================

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'staff' })
                                .select('-password')
                                .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân sự', error: error.message });
    }
};;

exports.createStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã được sử dụng' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStaff = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'staff',
            isActive: true
        });

        res.status(201).json({ message: 'Tạo tài khoản Staff thành công', user: { id: newStaff._id, name, email } });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo nhân viên', error: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        user.isActive = !user.isActive; // Đảo ngược trạng thái
        await user.save();

        res.json({ message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', isActive: user.isActive });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.json({ message: 'Đã xóa tài khoản vĩnh viễn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa tài khoản', error: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        // Mật khẩu mặc định khi reset
        const defaultPassword = 'Password@123';
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(defaultPassword, salt);
        
        await user.save();
        res.json({ message: `Reset mật khẩu thành công. Mật khẩu mới là: ${defaultPassword}` });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi reset mật khẩu', error: error.message });
    }
};