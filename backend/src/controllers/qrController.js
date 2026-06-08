const QRCode = require('qrcode');
const Table = require('../models/Table');
const Order = require('../models/Order');

// GET /api/qr/table/:tableId
// Sinh QR chứa URL check-in cho 1 bàn cụ thể, trả về ảnh PNG
exports.getTableQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.tableId);
    if (!table) {
      return res.status(404).json({ message: 'Bàn không tồn tại' });
    }

    // URL mà khách sẽ được chuyển tới khi quét QR
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkInUrl = `${frontendUrl}/table/${table._id}`;

    // Sinh QR dưới dạng Data URL (base64 image)
    const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      tableId: table._id,
      tableNumber: table.number,
      checkInUrl: checkInUrl,
      qrCode: qrDataUrl // Chuỗi base64 của ảnh QR, FE dùng thẳng trong thẻ <img src="...">
    });
  } catch (error) {
    console.error('Lỗi tạo QR check-in:', error);
    res.status(500).json({ message: 'Không thể tạo QR code' });
  }
};

// GET /api/qr/tables
// Sinh QR cho TẤT CẢ các bàn (để admin in hàng loạt)
exports.getAllTableQRs = async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ number: 1 });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const results = await Promise.all(
      tables.map(async (table) => {
        const checkInUrl = `${frontendUrl}/table/${table._id}`;
        const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
          width: 400,
          margin: 2
        });
        return {
          tableId: table._id,
          tableNumber: table.number,
          checkInUrl,
          qrCode: qrDataUrl
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Lỗi tạo QR hàng loạt:', error);
    res.status(500).json({ message: 'Không thể tạo QR codes' });
  }
};

// GET /api/qr/payment/:orderId
// Sinh QR thanh toán chuyển khoản ngân hàng theo chuẩn VietQR
exports.getPaymentQR = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
        }
        if (req.user.role === 'user' && (!order.user || order.user.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Tinh toán tổng tiền cần thanh toán
        const VAT_RATE = 0.08; // Giữ khớp với tableController

        // subTotal là giá gốc chưa VAT
        const subTotal = order.totalAmount || order.items.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );
        const vatAmount = Math.round(subTotal * VAT_RATE);
        const totalWithVat = subTotal + vatAmount;

        // Thông tin ngân hàng từ .env
        const bankId = process.env.BANK_ID;
        const accountNo = process.env.BANK_ACCOUNT;
        const accountName = process.env.BANK_NAME;
        if (!bankId || !accountNo || !accountName) {
            return res.status(500).json({ message: 'Thiếu cấu hình BANK_ID/BANK_ACCOUNT/BANK_NAME' });
        }

        // Noi dung thanh toan theo chuẩn VietQR (có thể tùy chỉnh thêm nếu cần)
        const transferContent = `THANH TOAN ${order._id.toString().slice(-8).toUpperCase()}`;

        // Tạo URL ảnh QR từ API VietQR (miễn phí, không cần đăng ký)
        const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png`
                        + `?amount=${totalWithVat}`
                        + `&addInfo=${encodeURIComponent(transferContent)}`
                        + `&accountName=${encodeURIComponent(accountName)}`;
        
        res.json({
            orderId: order._id,
            subTotal,
            vatAmount,
            totalAmount: totalWithVat,  // ← Số tiền cuối cùng khách cần trả
            transferContent,
            bankInfo: {
                bankId,
                accountNo,
                accountName
            },
            qrCode: vietQrUrl
        });
    } catch (error) {
        console.error('Lỗi tạo QR thanh toán:', error);
        res.status(500).json({ message: 'Không thể tạo QR code thanh toán' });
    }
};