const Y = require("yjs");
const { loadState, saveState, startAutosave } = require("./persistence");

const rooms = new Map(); // roomId -> { doc, users, dirty }
const loadingPromises = new Map();

const EMPTY_ROOM_TTL_MS = 5 * 60 * 1000;
const emptyRoomTimers = new Map();

startAutosave(rooms);

async function getOrCreateRoom(roomId) {
  clearEvictionTimer(roomId);
  let room = rooms.get(roomId);
  if (room) {
    const pending = loadingPromises.get(roomId);
    if (pending) await pending; // concurrent join mid-load — wait for the same load
    return room;
  }

  const doc = new Y.Doc();
  room = { doc, users: new Map(), dirty: false };
  rooms.set(roomId, room);

  const loadPromise = (async () => {
    const persisted = await loadState(roomId);
    if (persisted) Y.applyUpdate(doc, persisted);
    // Attached after applying persisted state so loading doesn't itself mark dirty.
    doc.on("update", () => { room.dirty = true; });
  })();
  loadingPromises.set(roomId, loadPromise);
  await loadPromise;
  loadingPromises.delete(roomId);

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

function scheduleEvictionIfEmpty(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.users.size > 0) return;

  clearEvictionTimer(roomId);
  const timer = setTimeout(async () => {
    const current = rooms.get(roomId);
    if (current && current.users.size === 0) {
      if (current.dirty) await saveState(roomId, current.doc);
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

module.exports = { rooms, getOrCreateRoom, getRoom, roomExists, scheduleEvictionIfEmpty, listUsers };