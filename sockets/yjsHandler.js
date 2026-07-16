const Y = require("yjs");
const { getOrCreateRoom, getRoom } = require("./roomStore");

/**
 * Relays a room's Yjs document between clients:
 *  - on join, sends the joining client the full current doc state
 *    (so a late joiner isn't missing anything the room already has)
 *  - after that, only incremental updates are exchanged
 *  - awareness (cursor/presence) updates are relayed but not stored —
 *    they're ephemeral by nature, so there's nothing worth persisting
 */
function yjsHandler(io, socket) {
  // Runs alongside roomHandler's own "room:join" listener — Socket.io
  // supports multiple independent listeners on the same event.
  socket.on("room:join", ({ roomId }) => {
    if (!roomId) return;
    const room = getOrCreateRoom(roomId);
    const fullState = Y.encodeStateAsUpdate(room.doc);
    socket.emit("yjs:sync", Buffer.from(fullState));
  });

  socket.on("yjs:update", ({ roomId, update }) => {
    if (!roomId || !update) return;
    const room = getRoom(roomId);
    if (!room) return;

    try {
      Y.applyUpdate(room.doc, Buffer.from(update), socket.id);
    } catch (err) {
      console.error(`Rejected malformed Yjs update from ${socket.id} in room ${roomId}:`, err.message);
      return;
    }

    socket.to(roomId).emit("yjs:update", Buffer.from(update));
  });

  socket.on("awareness:update", ({ roomId, update }) => {
    if (!roomId || !update) return;
    if (!getRoom(roomId)) return;
    socket.to(roomId).emit("awareness:update", Buffer.from(update));
  });
}

module.exports = yjsHandler;