const rooms = {}; // { roomId: Set of socketIds }

function roomHandle(io, socket) {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.data.roomId = roomId;

    // Track this user in the room
    if (!rooms[roomId]) {
      rooms[roomId] = new Set();
    }
    rooms[roomId].add(socket.id);

    console.log(`Socket ${socket.id} joined room ${roomId}`);

    // Send the new joiner the current list of users already in the room
    socket.emit('roomUsers', Array.from(rooms[roomId]));

    // Notify everyone else that someone new joined
    socket.to(roomId).emit('userJoined', { socketId: socket.id });
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    rooms[roomId]?.delete(socket.id);
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('userLeft', { socketId: socket.id });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId].delete(socket.id);
      socket.to(roomId).emit('userLeft', { socketId: socket.id });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
}

module.exports = roomHandler;