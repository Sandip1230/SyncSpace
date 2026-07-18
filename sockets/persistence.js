const AUTOSAVE_INTERVAL_MS = 15000;
let autosaveTimer = null;

async function loadState() {
  return null;
}

async function saveState() {
  return null;
}

function startAutosave(rooms) {
  if (autosaveTimer) return;
  autosaveTimer = setInterval(async () => {
    for (const room of rooms.values()) {
      room.dirty = false;
    }
  }, AUTOSAVE_INTERVAL_MS);
  autosaveTimer.unref?.();
}

function stopAutosave() {
  clearInterval(autosaveTimer);
  autosaveTimer = null;
}

async function flushAll() {
  return null;
}

module.exports = { loadState, saveState, startAutosave, stopAutosave, flushAll };