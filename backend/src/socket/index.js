let io;

function initSocket(socketServer) {
  io = socketServer;
  io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('join-kitchen', () => socket.join('kitchen'));
    socket.on('join-table', (tableId) => {
      if (tableId) socket.join(`table_${tableId}`);
    });
    socket.on('leave-table', (tableId) => {
      if (tableId) socket.leave(`table_${tableId}`);
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
  });
}

function getIO() {
  if (!io) throw new Error('Socket not initialized');
  return io;
}

module.exports = { initSocket, getIO };
