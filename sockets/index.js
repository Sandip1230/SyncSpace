const roomHandler = require("./roomHandler");
const yjsHandler = require("./yjsHandler");

/**
 * Wires up every socket event handler for a single connection.
 * Room membership and Yjs sync are split into two files but share
 * the same in-memory room registry (./roomStore) so presence and
 * document state stay consistent for a given roomId.
 */
function registerSocketHandlers(io, socket) {
  roomHandler(io, socket);
  yjsHandler(io, socket);
}

module.exports = registerSocketHandlers;