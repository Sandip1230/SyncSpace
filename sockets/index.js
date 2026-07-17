// sockets/index.js
const Y = require('yjs');
const Space = require('../models/Space');

const saveTimeouts = new Map();

function bindSocketEngine(io, socket, activeSpaces) {
  
  // Handle space connection initialization
  socket.on('space:join', async ({ spaceId, username }) => {
    socket.join(spaceId);
    socket.spaceId = spaceId;
    socket.username = username;

    console.log(`👤 User [${username}] linked to Space room: [${spaceId}]`);

    // Hydrate state buffer mapping from database if room memory is blank
    if (!activeSpaces.has(spaceId)) {
      const newDoc = new Y.Doc();
      try {
        const savedSpace = await Space.findOne({ spaceId });
        if (savedSpace && savedSpace.documentState) {
          Y.applyUpdate(newDoc, savedSpace.documentState);
          console.log(`💾 Hydrated space document [${spaceId}] from MongoDB state buffer`);
        }
      } catch (err) {
        console.error('🚨 Mongoose hydration payload matrix failed:', err);
      }
      activeSpaces.set(spaceId, newDoc);
    }

    socket.to(spaceId).emit('space:user-joined', { socketId: socket.id, username });
  });

  // Main CRDT Conflict-Free Text/Canvas Binary Channel
  socket.on('sync:yjs-update', ({ spaceId, updateBuffer }) => {
    const ydoc = activeSpaces.get(spaceId);
    if (ydoc) {
      try {
        Y.applyUpdate(ydoc, Buffer.from(updateBuffer));
        socket.to(spaceId).emit('sync:yjs-update-broadcast', updateBuffer);

        // Debounce database hit rate to prevent performance issues
        if (saveTimeouts.has(spaceId)) {
          clearTimeout(saveTimeouts.get(spaceId));
        }

        const timeout = setTimeout(async () => {
          try {
            const stateSnapshot = Y.encodeStateAsUpdate(ydoc);
            await Space.findOneAndUpdate(
              { spaceId },
              { documentState: Buffer.from(stateSnapshot), lastSavedAt: new Date() },
              { upsert: true }
            );
            console.log(`💾 Autosaved modern state vector chunk for Space [${spaceId}]`);
            saveTimeouts.delete(spaceId);
          } catch (dbErr) {
            console.error('🚨 MongoDB automatic persistence thread failed:', dbErr);
          }
        }, 3000); // 3 seconds of buffer delay

        saveTimeouts.set(spaceId, timeout);
      } catch (error) {
        console.error(`🚨 CRDT math sync exception handled for room ${spaceId}:`, error);
      }
    }
  });

  // Catch up clients connecting late
  socket.on('sync:request-initial-state', ({ spaceId }, callback) => {
    if (activeSpaces.has(spaceId)) {
      const ydoc = activeSpaces.get(spaceId);
      const stateVector = Y.encodeStateAsUpdate(ydoc);
      callback(stateVector);
    } else {
      callback(null);
    }
  });
}

module.exports = { bindSocketEngine };
