const crypto = require('crypto');
const moment = require('moment-timezone');

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

function getConfig() {
    const required = ['VNPAY_TMN_CODE', 'VNPAY_HASH_SECRET', 'VNPAY_PAYMENT_URL', 'VNPAY_RETURN_URL'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        const error = new Error(`Missing VNPay configuration: ${missing.join(', ')}`);
        error.statusCode = 500;
        throw error;
    }

    return {
        tmnCode: process.env.VNPAY_TMN_CODE,
        hashSecret: process.env.VNPAY_HASH_SECRET,
        paymentUrl: process.env.VNPAY_PAYMENT_URL,
        returnUrl: process.env.VNPAY_RETURN_URL,
        version: process.env.VNPAY_VERSION || '2.1.0',
        command: process.env.VNPAY_COMMAND || 'pay',
        currCode: process.env.VNPAY_CURR_CODE || 'VND',
        locale: process.env.VNPAY_LOCALE || 'vn'
    };
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function formatVnpDate(date) {
    const m = moment.isMoment(date) ? date : moment(date);
    return m.format('YYYYMMDDHHmmss');
}

function sortObject(input) {
    return Object.keys(input)
        .sort()
        .reduce((result, key) => {
            if (input[key] !== undefined && input[key] !== null && input[key] !== '') {
                result[key] = input[key];
            }
            return result;
        }, {});
}

function buildSignedQuery(params, secret) {
    const sorted = sortObject(params);
    const signData = new URLSearchParams(sorted).toString();
    const secureHash = crypto
        .createHmac('sha512', secret)
        .update(signData, 'utf-8')
        .digest('hex');

    return new URLSearchParams({ ...sorted, vnp_SecureHash: secureHash }).toString();
}

function createPaymentUrl({ transactionCode, amount, ipAddress, orderInfo }) {
    const config = getConfig();
    const now = moment().tz(VN_TIMEZONE);
    const expireAt = now.clone().add(15, 'minutes');
    const params = {
        vnp_Version: config.version,
        vnp_Command: config.command,
        vnp_TmnCode: config.tmnCode,
        vnp_Amount: Math.round(amount) * 100,
        vnp_CurrCode: config.currCode,
        vnp_TxnRef: transactionCode,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_Locale: config.locale,
        vnp_ReturnUrl: config.returnUrl,
        vnp_IpAddr: ipAddress || '127.0.0.1',
        vnp_CreateDate: formatVnpDate(now),
        vnp_ExpireDate: formatVnpDate(expireAt)
    };

    return `${config.paymentUrl}?${buildSignedQuery(params, config.hashSecret)}`;
}

function verifyCallback(query) {
    const config = getConfig();
    const secureHash = query.vnp_SecureHash;
    if (!secureHash) return false;

    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const signedQuery = buildSignedQuery(params, config.hashSecret);
    const expectedHash = new URLSearchParams(signedQuery).get('vnp_SecureHash');
    const received = Buffer.from(secureHash);
    const expected = Buffer.from(expectedHash);
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

module.exports = {
    createPaymentUrl,
    verifyCallback
};
