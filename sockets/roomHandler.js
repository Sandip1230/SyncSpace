const { getOrCreateRoom, getRoom, listUsers, scheduleEvictionIfEmpty } = require("./roomStore");
const { isValidRoomId, sanitizeUsername } = require("./validators");

function roomHandler(io, socket) {
  socket.on("room:join", async ({ roomId, username }) => {
    if (!isValidRoomId(roomId)) {
      socket.emit("room:error", { message: "Invalid room ID." });
      return;
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = sanitizeUsername(username);

    const room = await getOrCreateRoom(roomId);
    const isFirstUser = room.users.size === 0;
    if (isFirstUser) {
      room.adminSocketId = socket.id;
    }
    room.users.set(socket.id, { username: socket.data.username });

    socket.emit("room:users", listUsers(roomId));
    socket.to(roomId).emit("room:user-joined", {
      socketId: socket.id,
      username: socket.data.username,
      isAdmin: isFirstUser,
    });
  });

  socket.on("room:leave", () => leaveCurrentRoom(io, socket));
  socket.on("disconnect", () => leaveCurrentRoom(io, socket));
}

function leaveCurrentRoom(io, socket) {
  const roomId = socket.data.roomId;
  if (!roomId) return;
  const room = getRoom(roomId);
  if (room) {
    room.users.delete(socket.id);

    if (room.adminSocketId === socket.id) {
      const nextAdmin = room.users.keys().next().value || null;
      room.adminSocketId = nextAdmin;
      // Let everyone still in the room know the fresh admin status.
      io.to(roomId).emit("room:users", listUsers(roomId));
    }

    socket.to(roomId).emit("room:user-left", { socketId: socket.id });
    scheduleEvictionIfEmpty(roomId);
  }
  socket.leave(roomId);
  socket.data.roomId = null;
}

module.exports = roomHandler;