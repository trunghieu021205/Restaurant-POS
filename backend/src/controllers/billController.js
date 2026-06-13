const Bill = require('../models/Bill');
const Table = require('../models/Table');
const { buildBillResponse } = require('../services/billService');
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Hoá đơn không tồn tại' });

    const table = await Table.findById(bill.tableId);
    if (!table) return res.status(404).json({ message: 'Bàn không tồn tại' });

    const built = await buildBillResponse(bill, table);
    return res.json(built);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy thông tin hóa đơn' });
  }
};

exports.getBillReceipt = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Hoá đơn không tồn tại' });
    if (bill.status !== 'paid') return res.status(403).json({ message: 'Hoá đơn chưa được thanh toán' });

    const table = await Table.findById(bill.tableId);
    if (!table) return res.status(404).json({ message: 'Bàn không tồn tại' });

    const built = await buildBillResponse(bill, table);
    return res.json(built);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể lấy thông tin hoá đơn' });
  }
};