const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const TableAuditLog = require('../models/TableAuditLog');
const PaymentNotification = require('../models/PaymentNotification');
const { getOrCreateOpenBillForTable } = require('../services/billService');
const { getIO } = require('../socket');
const { resolveTableByIdentifier } = require('../utils/resolveTable');

const QR_TOKEN_EXPIRES_IN = '30d';
const TABLE_SESSION_EXPIRES_IN = '8h';

function signTableQrToken(table) {
  return jwt.sign(
    { purpose: 'table_qr', tableId: table._id.toString(), tableNumber: table.number },
    process.env.JWT_SECRET,
    { expiresIn: QR_TOKEN_EXPIRES_IN }
  );
}

function signTableSessionToken(table) {
  return jwt.sign(
    { purpose: 'table_session', tableId: table._id.toString(), tableNumber: table.number },
    process.env.JWT_SECRET,
    { expiresIn: TABLE_SESSION_EXPIRES_IN }
  );
}

function verifyToken(token, purpose) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== purpose) {
    throw new Error('Invalid token purpose');
  }
  return payload;
}

const PHONE_PATTERN = /^[0-9+\-\s().]{8,20}$/;

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sameCustomer(left, right) {
  return normalizeText(left).toLowerCase() === normalizeText(right).toLowerCase();
}

function isValidPhone(phone) {
  return PHONE_PATTERN.test(phone);
}

exports.getTableQR = async (req, res) => {
  try {
    const table = await resolveTableByIdentifier(req.params.tableId);
    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrToken = signTableQrToken(table);
    const checkInUrl = `${frontendUrl}/table/${table.number}?qrToken=${encodeURIComponent(qrToken)}`;
    const qrCode = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return res.json({
      tableId: table._id.toString(),
      tableNumber: table.number,
      checkInUrl,
      qrCode
    });
  } catch (error) {
    console.error('Create table QR error:', error);
    return res.status(500).json({ message: 'Không thể tạo mã QR cho bàn' });
  }
};

exports.getAllTableQRs = async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ number: 1 });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const results = await Promise.all(
      tables.map(async (table) => {
        const qrToken = signTableQrToken(table);
        const checkInUrl = `${frontendUrl}/table/${table.number}?qrToken=${encodeURIComponent(qrToken)}`;
        const qrCode = await QRCode.toDataURL(checkInUrl, {
          width: 400,
          margin: 2
        });

        return {
          tableId: table._id.toString(),
          tableNumber: table.number,
          checkInUrl,
          qrCode
        };
      })
    );

    return res.json(results);
  } catch (error) {
    console.error('Create table QRs error:', error);
    return res.status(500).json({ message: 'Không thể tạo mã QR cho các bàn' });
  }
};

exports.checkInTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { qrToken, customerName: rawName, customerPhone: rawPhone } = req.body;
    const customerName = normalizeText(rawName);
    const customerPhone = normalizeText(rawPhone);

    if (!qrToken) {
      return res.status(400).json({ message: 'Thiếu QR token' });
    }

    const table = await resolveTableByIdentifier(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại' });
    }

    const payload = verifyToken(qrToken, 'table_qr');
    if (payload.tableId !== table._id.toString()) {
      return res.status(403).json({ message: 'Mã QR không khớp với bàn' });
    }

    if (table.status === 'occupied') {
      return res.status(409).json({ message: 'Bàn đang được sử dụng' });
    }

    if (table.status === 'reserved') {
      if (!customerPhone || table.customerPhone !== customerPhone) {
        return res.status(409).json({ message: 'Bàn này đã được đặt trước. Vui lòng nhập số điện thoại đặt bàn.' });
      }
    } else if (!customerName || !isValidPhone(customerPhone)) {
      return res.status(400).json({ message: 'Tên khách hàng và số điện thoại hợp lệ là bắt buộc' });
    }

    const nextCustomerName = table.status === 'reserved' ? table.customerName : customerName;
    const nextCustomerPhone = table.status === 'reserved' ? table.customerPhone : customerPhone;
    const fromStatus = table.status;

    table.status = 'occupied';
    table.customerName = nextCustomerName;
    table.customerPhone = nextCustomerPhone;
    table.checkedInAt = new Date();
    await table.save();

    const bill = await getOrCreateOpenBillForTable(table, {
      customerName: nextCustomerName,
      customerPhone: nextCustomerPhone
    });

    await TableAuditLog.create({
      tableId: table._id,
      action: 'check_in',
      fromStatus,
      toStatus: table.status,
      metadata: { customerName: nextCustomerName, customerPhone: nextCustomerPhone, billId: bill._id }
    });

    try {
      getIO().to('staff').emit('table_status_updated', {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: table.customerName,
        customerPhone: table.customerPhone,
        checkedInAt: table.checkedInAt,
        reservedAt: table.reservedAt,
        billId: bill._id.toString(),
        billStatus: bill.status,
        totalAmount: bill.totalAmount,
        updatedAt: table.updatedAt
      });
    } catch (emitError) {
      console.error('Emit table_status_updated failed:', emitError);
    }

    return res.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: table.customerName,
        customerPhone: table.customerPhone,
        checkedInAt: table.checkedInAt
      },
      sessionToken: signTableSessionToken(table)
    });
  } catch (error) {
    console.error('Table check-in failed:', error);
    return res.status(401).json({ message: 'Mã QR không hợp lệ hoặc đã hết hạn' });
  }
};

exports.validateTableSession = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ message: 'Thiếu token phiên làm việc của bàn' });
    }

    const table = await resolveTableByIdentifier(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại' });
    }

    const payload = verifyToken(sessionToken, 'table_session');
    if (payload.tableId !== table._id.toString()) {
      return res.status(403).json({ message: 'Token phiên làm việc không khớp với bàn' });
    }

    if (table.status !== 'occupied' || !table.checkedInAt) {
      return res.status(409).json({ message: 'Phiên làm việc của bàn không còn hoạt động' });
    }

    return res.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: table.customerName,
        customerPhone: table.customerPhone,
        checkedInAt: table.checkedInAt
      }
    });
  } catch (error) {
    console.error('Table session validation failed:', error);
    return res.status(401).json({ message: 'Mã phiên làm việc không hợp lệ hoặc đã hết hạn' });
  }
};

exports.rejoinTableSession = async (req, res) => {
  try {
    const { tableId } = req.params;
    const customerName = normalizeText(req.body.customerName);
    const customerPhone = normalizeText(req.body.customerPhone);

    if (!customerName || !isValidPhone(customerPhone)) {
      return res.status(400).json({ message: 'Tên khách hàng và số điện thoại hợp lệ là bắt buộc' });
    }

    const table = await resolveTableByIdentifier(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại' });
    }

    if (table.status !== 'occupied' || !table.checkedInAt) {
      return res.status(409).json({ message: 'Phiên bàn không còn hoạt động' });
    }

    const bill = await Bill.findOne({ tableId: table._id, status: 'open' }).sort({ createdAt: -1 });
    if (!bill) {
      return res.status(409).json({ message: 'Không tìm thấy phiên hóa đơn đang mở' });
    }

    const nameMatches = sameCustomer(table.customerName || bill.customerName, customerName);
    const phoneMatches = normalizeText(table.customerPhone || bill.customerPhone) === customerPhone;
    if (!nameMatches || !phoneMatches) {
      return res.status(403).json({ message: 'Thông tin khách hàng không khớp với phiên bàn hiện tại' });
    }

    return res.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status,
        customerName: table.customerName,
        customerPhone: table.customerPhone,
        checkedInAt: table.checkedInAt
      },
      sessionToken: signTableSessionToken(table)
    });
  } catch (error) {
    console.error('Table rejoin failed:', error);
    return res.status(500).json({ message: 'Không thể khôi phục phiên bàn' });
  }
};

exports.getPaymentQR = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Hóa đơn không tồn tại' });
    }

    if (bill.status !== 'open') {
      return res.status(400).json({ message: 'Hóa đơn không ở trạng thái mở' });
    }

    const bankId = process.env.BANK_ID;
    const accountNo = process.env.BANK_ACCOUNT;
    const accountName = process.env.BANK_NAME;
    if (!bankId || !accountNo || !accountName) {
      return res.status(500).json({ message: 'Thiếu cấu hình BANK_ID/BANK_ACCOUNT/BANK_NAME' });
    }

    const transferContent = `THANH TOAN BILL ${bill._id.toString().slice(-8).toUpperCase()}`;
    const qrCode = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png`
      + `?amount=${bill.totalAmount}`
      + `&addInfo=${encodeURIComponent(transferContent)}`
      + `&accountName=${encodeURIComponent(accountName)}`;

    const table = await Table.findById(bill.tableId);
    if (table) {
      try {
        let notification = await PaymentNotification.findOne({
          tableId: table._id,
          billId: bill._id,
          type: 'online_qr_payment',
          paymentStatus: 'pending'
        }).sort({ createdAt: -1 });

        if (!notification) {
          notification = await PaymentNotification.create({
            tableId: table._id,
            billId: bill._id,
            type: 'online_qr_payment',
            paymentStatus: 'pending',
            amount: bill.totalAmount,
            method: 'online_qr'
          });
        }
        const payload = {
          id: notification._id.toString(),
          tableId: table._id.toString(),
          tableNumber: table.number,
          billId: bill._id.toString(),
          type: notification.type,
          paymentStatus: notification.paymentStatus,
          amount: bill.totalAmount,
          method: 'online_qr',
          createdAt: notification.createdAt
        };
        getIO().to('staff').emit('payment_notification', payload);
        getIO().to('staff').emit('payment_notification_detail', payload);
      } catch (emitError) {
        console.error('Emit QR payment notification failed:', emitError);
      }
    }

    return res.json({
      billId: bill._id,
      tableId: bill.tableId,
      subtotal: bill.subtotal,
      tax: bill.tax,
      discount: bill.discount,
      totalAmount: bill.totalAmount,
      transferContent,
      bankInfo: {
        bankId,
        accountNo,
        accountName
      },
      qrCode
    });
  } catch (error) {
    console.error('Create payment QR error:', error);
    return res.status(500).json({ message: 'Không thể tạo mã QR thanh toán' });
  }
};
