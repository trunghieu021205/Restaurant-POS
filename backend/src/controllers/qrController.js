const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
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

exports.getTableQR = async (req, res) => {
  try {
    const table = await resolveTableByIdentifier(req.params.tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
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
    return res.status(500).json({ message: 'Failed to create table QR code' });
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
    return res.status(500).json({ message: 'Failed to create table QR codes' });
  }
};

exports.checkInTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({ message: 'Missing QR token' });
    }

    const table = await resolveTableByIdentifier(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const payload = verifyToken(qrToken, 'table_qr');
    if (payload.tableId !== table._id.toString()) {
      return res.status(403).json({ message: 'QR token does not match table' });
    }

    if (table.status === 'occupied') {
      return res.status(409).json({ message: 'Table is currently occupied' });
    }

    return res.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status
      },
      sessionToken: signTableSessionToken(table)
    });
  } catch (error) {
    console.error('Table check-in failed:', error);
    return res.status(401).json({ message: 'Invalid or expired QR token' });
  }
};

exports.validateTableSession = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ message: 'Missing table session token' });
    }

    const table = await resolveTableByIdentifier(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    const payload = verifyToken(sessionToken, 'table_session');
    if (payload.tableId !== table._id.toString()) {
      return res.status(403).json({ message: 'Table session does not match table' });
    }

    return res.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
        status: table.status
      }
    });
  } catch (error) {
    console.error('Table session validation failed:', error);
    return res.status(401).json({ message: 'Invalid or expired table session' });
  }
};

exports.getPaymentQR = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status !== 'open') {
      return res.status(400).json({ message: 'Bill is not open' });
    }

    const bankId = process.env.BANK_ID;
    const accountNo = process.env.BANK_ACCOUNT;
    const accountName = process.env.BANK_NAME;
    if (!bankId || !accountNo || !accountName) {
      return res.status(500).json({ message: 'Missing BANK_ID/BANK_ACCOUNT/BANK_NAME config' });
    }

    const transferContent = `THANH TOAN BILL ${bill._id.toString().slice(-8).toUpperCase()}`;
    const qrCode = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png`
      + `?amount=${bill.totalAmount}`
      + `&addInfo=${encodeURIComponent(transferContent)}`
      + `&accountName=${encodeURIComponent(accountName)}`;

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
    return res.status(500).json({ message: 'Failed to create payment QR code' });
  }
};
