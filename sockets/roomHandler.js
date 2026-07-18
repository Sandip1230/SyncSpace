const { getOrCreateRoom, getRoom, listUsers, scheduleEvictionIfEmpty } = require("./roomStore");

function roomHandler(io, socket) {
  socket.on("room:join", async ({ roomId, username }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username || "Anonymous";

    const room = await getOrCreateRoom(roomId);
    room.users.set(socket.id, { username: socket.data.username });

    socket.emit("room:users", listUsers(roomId));
    socket.to(roomId).emit("room:user-joined", { socketId: socket.id, username: socket.data.username });
  });

  socket.on("room:leave", () => leaveCurrentRoom(socket));
  socket.on("disconnect", () => leaveCurrentRoom(socket));
}

function leaveCurrentRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  const room = getRoom(roomId);
  if (room) {
    room.users.delete(socket.id);
    socket.to(roomId).emit("room:user-left", { socketId: socket.id });
    scheduleEvictionIfEmpty(roomId);
  }
  socket.leave(roomId);
  socket.data.roomId = null;
}

module.exports = roomHandler;