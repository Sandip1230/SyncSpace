const Y = require("yjs");

/**
 * In-memory registry of active rooms: one Y.Doc + a set of connected
 * users per room. This is a live relay hub, not durable storage — actual
 * persistence lives client-side (IndexedDB), so an empty room is safe to
 * evict after a grace period without losing anyone's work permanently.
 */
const rooms = new Map(); // roomId -> { doc: Y.Doc, users: Map<socketId, {username}> }

const EMPTY_ROOM_TTL_MS = 5 * 60 * 1000; // 5 min grace period before a doc is freed
const emptyRoomTimers = new Map();

function getOrCreateRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = { doc: new Y.Doc(), users: new Map() };
    rooms.set(roomId, room);
  }
  clearEvictionTimer(roomId);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function roomExists(roomId) {
  return rooms.has(roomId);
}

function clearEvictionTimer(roomId) {
  const timer = emptyRoomTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    emptyRoomTimers.delete(roomId);
  }
}

/** Schedules a room's Y.Doc for cleanup once nobody's connected. */
function scheduleEvictionIfEmpty(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size > 0) return;

  clearEvictionTimer(roomId);
  const timer = setTimeout(() => {
    const current = rooms.get(roomId);
    if (current && current.users.size === 0) {
      current.doc.destroy();
      rooms.delete(roomId);
    }
    emptyRoomTimers.delete(roomId);
  }, EMPTY_ROOM_TTL_MS);
  emptyRoomTimers.set(roomId, timer);
}

function listUsers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users.entries()).map(([socketId, info]) => ({ socketId, ...info }));
}

module.exports = {
  rooms,
  getOrCreateRoom,
  getRoom,
  roomExists,
  scheduleEvictionIfEmpty,
  listUsers,
};