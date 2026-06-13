// 🌟 1. NẠP BIẾN MÔI TRƯỜNG Ở DÒNG ĐẦU TIÊN: Đảm bảo mọi module nạp phía sau đều đọc được cấu hình .env
require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./utils/db');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
});

app.use(cors());
app.use(express.json());

// Mở cổng chia sẻ thư mục tĩnh public dự phòng nếu hệ thống cần lưu/truy cập ảnh cục bộ công khai
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// --- KHU VỰC CÁC TUYẾN ĐƯỜNG API TRUYỀN THỐNG CỦA NHÓM ---
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/api/menu', menuRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const qrRoutes = require('./routes/qrRoutes');
app.use('/api/qr', qrRoutes);

const tableRoutes = require('./routes/tableRoutes');
app.use('/api/tables', tableRoutes);

const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/api/categories', categoriesRoutes);

const billRoutes = require('./routes/billRoutes');
app.use('/api/bills', billRoutes);

app.get('/', (req, res) => res.send('API running'));


const { initSocket } = require('./socket');
initSocket(io);
// --- KHU VỰC CÁC TUYẾN ĐƯỜNG ADMIN ĐỘC LẬP (ĐÃ THÊM MỚI BẢO VỆ CONFLICT) ---
const categoriesAdminRoutes = require('./routes/categoriesAdminRoutes');
app.use('/api/admin/categories', categoriesAdminRoutes);

const menuAdminRoutes = require('./routes/menuAdminRoutes');
app.use('/api/admin/menu', menuAdminRoutes);

const statsAdminRoutes = require('./routes/statsAdminRoutes');
app.use('/api/admin/stats', statsAdminRoutes);

app.get('/', (req, res) => res.send('API running'));

// Start cron jobs
try {
  const { startCronJobs } = require('./utils/cron');
  startCronJobs();
} catch (e) {
  console.error('Failed to start cron jobs:', e);
}

// Thêm kiểm tra socket ready
if (!io) {
  console.error('CRITICAL: Socket failed to initialize');
  process.exit(1);
}

// 🌟 BỘ LỌC LỖI TOÀN CỤC CHUẨN JSON (GLOBAL ERROR HANDLER):
// Chặn đứng hoàn toàn việc văng trang HTML lỗi thô, đảm bảo Frontend luôn nhận về JSON dễ đọc.
app.use((err, req, res, next) => {
  console.error('🚨 [SERVER ERROR LOG]:', err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Đã xảy ra lỗi hệ thống nội bộ bên phía Server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));
