require('dotenv').config();
const { createPaymentUrl } = require('../src/services/vnpayService');

// Giả lập không set TZ để test
const url = createPaymentUrl({
    transactionCode: 'TEST001',
    amount: 100000,
    ipAddress: '127.0.0.1',
    orderInfo: 'Test timezone'
});

// Trích xuất vnp_CreateDate từ URL
const params = new URLSearchParams(url.split('?')[1]);
const createDate = params.get('vnp_CreateDate');
const expireDate = params.get('vnp_ExpireDate');

console.log('vnp_CreateDate:', createDate);
console.log('vnp_ExpireDate:', expireDate);

// Kiểm tra nhanh: Giờ hiện tại Việt Nam
const nowVN = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
console.log('Giờ Việt Nam hiện tại:', nowVN);

// Parse createDate để kiểm tra
const year = createDate.substring(0, 4);
const month = createDate.substring(4, 6);
const day = createDate.substring(6, 8);
const hour = createDate.substring(8, 10);
const minute = createDate.substring(10, 12);
const second = createDate.substring(12, 14);
console.log(`Ngày giờ trong CreateDate: ${year}-${month}-${day} ${hour}:${minute}:${second}`);
console.log('=> Nếu giờ khớp với giờ VN phía trên là OK, nếu lệch ~7 tiếng là SAI');