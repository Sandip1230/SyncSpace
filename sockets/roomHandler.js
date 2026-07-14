function roomHandler(io, socket) {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('userJoined', { socketId: socket.id });
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('userLeft', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit('userLeft', { socketId: socket.id });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
}

module.exports = roomHandler;