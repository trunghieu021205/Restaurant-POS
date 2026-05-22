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

app.get('/', (req, res) => res.send('API running'));

const { initSocket } = require('./socket');
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));