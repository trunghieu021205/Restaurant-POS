const Order = require('../models/Order');
const Table = require('../models/Table');
const Bill = require('../models/Bill');
const Payment = require('../models/Payments');
const PaymentTransaction = require('../models/PaymentTransaction');
const { resolveTableByIdentifier } = require('../utils/resolveTable');
const {
    getOpenBillForTable,
    buildBillResponse
} = require('../services/billService');
const {
    createCashPaymentRequest,
    completePayment,
    createOnlinePaymentTransaction,
    handleVnpayCallback
} = require('../services/paymentService');

exports.processPayment = async (req, res) => {
    try {
        const { tableId, paymentMethod = 'cash' } = req.body;

        if (!tableId) {
            return res.status(400).json({ message: 'Thiếu tableId' });
        }

        const table = await resolveTableByIdentifier(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Bàn không tồn tại' });
        }

        const bill = await getOpenBillForTable(table._id);
        if (!bill) {
            return res.status(400).json({ message: 'Bàn không có hóa đơn mở để thanh toán' });
        }

        if (paymentMethod === 'cash') {
            const { payload, bill: refreshedBill } = await createCashPaymentRequest({ table, bill });
            return res.status(202).json({
                success: true,
                status: 'payment_requested',
                message: 'Payment request sent to staff',
                notification: payload,
                tableId: table._id,
                bill: await buildBillResponse(refreshedBill, table)
            });
        }

        if (paymentMethod !== 'online_qr') {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
        }

        const result = await completePayment({
            table,
            bill,
            method: 'online_qr',
            paidBy: req.user?.id,
            note: 'Simulated QR payment success'
        });

        return res.json({
            success: true,
            status: 'paid',
            message: 'Payment successful',
            tableId: table._id,
            payment: result.paymentPayload,
            bill: result.bill
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        return res.status(500).json({ message: 'Không thể xử lý thanh toán' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const paidBills = await Payment.find({ status: 'success' })
            .populate('billId', 'status totalAmount paidAt paymentMethod')
            .populate('tableId', 'number')
            .sort({ createdAt: -1 });

        return res.json(paidBills);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ message: 'Không thể lấy danh sách thanh toán' });
    }
};

exports.createPaymentTransaction = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'orderId là bắt buộc' });
        }

        const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
        const { transaction, paymentUrl } = await createOnlinePaymentTransaction({ orderId, ipAddress });

        return res.json({
            success: true,
            transactionId: transaction._id,
            transactionCode: transaction.transactionCode,
            paymentUrl
        });
    } catch (error) {
        console.error('Error creating payment transaction:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ message: error.message || 'Không thể tạo giao dịch thanh toán' });
    }
};

exports.handleVnpayCallback = async (req, res) => {
    try {
        const result = await handleVnpayCallback(req.query);

        if (result.alreadyProcessed) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/result?transactionId=${result.transaction._id}&status=already_processed`);
        }

        if (result.transaction.status === 'SUCCESS') {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/success?transactionId=${result.transaction._id}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?transactionId=${result.transaction._id}&reason=${encodeURIComponent(result.transaction.gatewayMessage || 'Thanh toán thất bại')}`);
        }
    } catch (error) {
        console.error('Error handling VNPay callback:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?reason=${encodeURIComponent('Lỗi xử lý callback')}`);
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await PaymentTransaction.findById(transactionId)
            .populate('orderId', 'orderNumber totalAmount')
            .populate('billId', 'totalAmount status')
            .populate('tableId', 'number');

        if (!transaction) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        return res.json({
            id: transaction._id,
            transactionCode: transaction.transactionCode,
            orderId: transaction.orderId._id,
            orderNumber: transaction.orderId.orderNumber,
            billId: transaction.billId._id,
            tableId: transaction.tableId._id,
            tableNumber: transaction.tableId.number,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod,
            paymentGateway: transaction.paymentGateway,
            status: transaction.status,
            paymentUrl: transaction.paymentUrl,
            gatewayTransactionId: transaction.gatewayTransactionId,
            gatewayResponseCode: transaction.gatewayResponseCode,
            gatewayMessage: transaction.gatewayMessage,
            paidAt: transaction.paidAt,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return res.status(500).json({ message: 'Không thể lấy thông tin giao dịch' });
    }
};

exports.getTransactionsByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const transactions = await PaymentTransaction.find({ orderId })
            .populate('tableId', 'number')
            .sort({ createdAt: -1 });

        return res.json(transactions.map(t => ({
            id: t._id,
            transactionCode: t.transactionCode,
            orderId: t.orderId,
            tableId: t.tableId._id,
            tableNumber: t.tableId.number,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            paymentGateway: t.paymentGateway,
            status: t.status,
            gatewayTransactionId: t.gatewayTransactionId,
            gatewayResponseCode: t.gatewayResponseCode,
            gatewayMessage: t.gatewayMessage,
            paidAt: t.paidAt,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
        })));
    } catch (error) {
        console.error('Error fetching transactions by order:', error);
        return res.status(500).json({ message: 'Không thể lấy danh sách giao dịch' });
    }
};
