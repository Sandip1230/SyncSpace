const Y = require("yjs");
const RoomDoc = require("../models/RoomDoc");

const AUTOSAVE_INTERVAL_MS = 15000;
let autosaveTimer = null;

async function loadState(roomId) {
  try {
    const record = await RoomDoc.findOne({ roomId }).lean();
    return record ? record.state : null;
  } catch (err) {
    console.error(`Failed to load persisted state for room ${roomId}:`, err.message);
    return null;
  }
}

async function saveState(roomId, doc) {
  try {
    const state = Buffer.from(Y.encodeStateAsUpdate(doc));
    await RoomDoc.updateOne({ roomId }, { $set: { state, updatedAt: new Date() } }, { upsert: true });
  } catch (err) {
    console.error(`Failed to persist room ${roomId}:`, err.message);
  }
}

// One global interval covers every active room rather than a timer per room.
function startAutosave(rooms) {
  if (autosaveTimer) return;
  autosaveTimer = setInterval(async () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.dirty) {
        room.dirty = false;
        await saveState(roomId, room.doc);
      }
    }
  }, AUTOSAVE_INTERVAL_MS);
  autosaveTimer.unref?.();
}

function stopAutosave() {
  clearInterval(autosaveTimer);
  autosaveTimer = null;
}

async function flushAll(rooms) {
  const saves = [];
  for (const [roomId, room] of rooms.entries()) {
    if (room.dirty) {
      room.dirty = false;
      saves.push(saveState(roomId, room.doc));
    }
  }
  await Promise.all(saves);
}

module.exports = { loadState, saveState, startAutosave, stopAutosave, flushAll };