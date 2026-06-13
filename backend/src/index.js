const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./utils/db');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
});

app.use(cors());
app.use(express.json());

connectDB();

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
