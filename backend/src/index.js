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

// CORS Origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-pos-xi-nine.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Socket.io CORS
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['polling', 'websocket']
});

// Express CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/categories', require('./routes/categoriesRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));

// Admin routes
app.use('/api/admin/categories', require('./routes/categoriesAdminRoutes'));
app.use('/api/admin/menu', require('./routes/menuAdminRoutes'));
app.use('/api/admin/stats', require('./routes/statsAdminRoutes'));

// Health check
app.get('/', (req, res) => res.json({ 
  status: 'ok', 
  message: 'API running',
  timestamp: new Date().toISOString()
}));

// Socket.io
const { initSocket } = require('./socket');
initSocket(io);

// Cron jobs
try {
  const { startCronJobs } = require('./utils/cron');
  startCronJobs();
} catch (e) {
  console.error('Failed to start cron jobs:', e);
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 [SERVER ERROR]:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start server với graceful shutdown
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});