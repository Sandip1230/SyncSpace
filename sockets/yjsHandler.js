const Y = require("yjs");
const { getOrCreateRoom, getRoom } = require("./roomStore");

function yjsHandler(io, socket) {
  socket.on("room:join", ({ roomId }) => {
    if (!roomId) return;
    const room = getOrCreateRoom(roomId);
    socket.emit("yjs:sync", Buffer.from(Y.encodeStateAsUpdate(room.doc)));
  });

  socket.on("yjs:update", ({ roomId, update }) => {
    if (!roomId || !update) return;
    const room = getRoom(roomId);
    if (!room) return;
    try {
      Y.applyUpdate(room.doc, Buffer.from(update), socket.id);
    } catch (err) {
      console.error(`Rejected malformed Yjs update from ${socket.id}:`, err.message);
      return;
    }
    socket.to(roomId).emit("yjs:update", Buffer.from(update));
  });

  // Cursor positions / who's-online awareness — relayed live, never stored.
  socket.on("awareness:update", ({ roomId, update }) => {
    if (!roomId || !update || !getRoom(roomId)) return;
    socket.to(roomId).emit("awareness:update", Buffer.from(update));
  });
}

module.exports = yjsHandler;