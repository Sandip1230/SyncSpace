/**
 * yjsRelay.js
 * ---------------------------------------------------------------
 * Server-side counterpart to src/lib/socketYjsProvider.js.
 * The server never decodes or understands the Yjs update bytes —
 * it just relays them to the right room, which is exactly what a
 * CRDT is designed to let you get away with.
 *
 * Wire this into the existing connection handler, next to
 * roomHandle(io, socket):
 *
 *   const roomHandle = require('./sockets/roomHandle');
 *   const yjsRelay   = require('./sockets/yjsRelay');
 *
 *   io.on('connection', (socket) => {
 *     roomHandle(io, socket);
 *     yjsRelay(io, socket);
 *   });
 *
 * NOTE: server.js currently does
 *   require('./sockets/roomHandler')
 * but the file on disk is named
 *   sockets/roomHandle.js
 * That mismatch will throw on server start — rename the file or
 * fix the require before this (or anything else) will run.
 *
 * Keeps the most recent full document state per room in memory so a
 * client that joins late can catch up. This is intentionally simple:
 * no persistence, no auth — matches the "Week 1-2, sync only" scope.
 * Week 3's MongoDB persistence layer can read/write the same
 * in-memory state without touching the client contract at all.
 */
function yjsRelay(io, socket) {
  // roomId -> latest known full-document update (base64 string)
  if (!global.__syncspaceDocState) global.__syncspaceDocState = new Map();
  const docState = global.__syncspaceDocState;

  socket.on("yjs-sync-request", ({ roomId }) => {
    const state = docState.get(roomId);
    if (state) {
      socket.emit("yjs-sync-response", { update: state });
    }
  });

  socket.on("yjs-update", ({ roomId, update }) => {

    // naive merge-by-replace: good enough while every client sends
    // whole-doc updates on change. Swap for Y.mergeUpdates server-side
    // once volume justifies it.
    docState.set(roomId, update);
    socket.to(roomId).emit("yjs-update", { update });

  });
}
module.exports = yjsRelay;
