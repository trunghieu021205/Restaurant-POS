const Bill = require('../models/Bill');
const Payment = require('../models/Payments');
const Table = require('../models/Table');
const Order = require('../models/Order');

const {
  buildBillResponse,
  refreshBillTotals,
} = require('../services/billService');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// Trả về danh sách bill đã thanh toán thành công trong ngày.
// Mục tiêu: staff xem và in lại hóa đơn đầy đủ thông tin (tên/sđt/món/thời gian/phương thức).
exports.getPaidBillsTodayForStaff = async (req, res) => {
  try {
    const from = startOfToday();
    const to = endOfToday();

    // Bill.status='paid' là nguồn chính để đảm bảo in đúng hóa đơn.
    // paidAt lấy từ Bill.paidAt.
    // Tuy nhiên hệ thống có thể có trường hợp paidAt null => fallback theo Payment.paidAt/createdAt.
    const bills = await Bill.find({
      status: 'paid',
      $or: [
        { paidAt: { $gte: from, $lte: to } },
        { paidAt: { $exists: false } },
        { paidAt: null },
      ],
    })
      .populate('tableId', 'number')
      .sort({ paidAt: -1 })
      .limit(200);

    // Build data theo chuẩn buildBillResponse (để in ra đủ items/orders)
    const result = [];

    for (const bill of bills) {
      // đảm bảo totals và paidAt ổn định
      let refreshed = null;
      try {
        refreshed = await refreshBillTotals(bill._id);
      } catch (e) {
        refreshed = bill;
      }

      const table = await Table.findById(bill.tableId);
      if (!table) continue;

      const payment = await Payment.findOne({
        billId: bill._id,
        status: 'success',
      }).sort({ createdAt: -1 });

      const built = await buildBillResponse(refreshed || bill, table);

      result.push({
        ...built,
        paidAt: (bill.paidAt || payment?.paidAt || payment?.createdAt || null)?.toISOString?.() || (bill.paidAt || payment?.paidAt || payment?.createdAt) || null,
        paymentMethod: built.paymentMethod || payment?.method || null,
        // buildBillResponse không trả về phương thức thanh toán - để in đúng, map thêm
        paymentGateway: payment?.method || null,
        paymentId: payment?._id?.toString?.() || null,
      });
    }

    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      items: result,
    });
  } catch (error) {
    console.error('getPaidBillsTodayForStaff error:', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách hóa đơn đã thanh toán trong hôm nay' });
  }
};

