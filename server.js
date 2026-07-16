// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Y = require('yjs');
const registerSocketHandlers = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const activeSpaces = new Map();

io.on('connection', (socket) => {

  registerSocketHandlers(io, socket);

  socket.on('space:join', ({ spaceId, username }) => {
    socket.join(spaceId);
    
    if (!activeSpaces.has(spaceId)) {
      activeSpaces.set(spaceId, new Y.Doc());
    }
    
    socket.to(spaceId).emit('space:user-joined', { username, socketId: socket.id });
  });

  socket.on('sync:yjs-update', ({ spaceId, update }) => {
    const doc = activeSpaces.get(spaceId);
    if (doc) {
      Y.applyUpdate(doc, Buffer.from(update));
      
      socket.to(spaceId).emit('sync:yjs-update-broadcast', update);
    }
  });

  socket.on('disconnect', () => {
  });
});

server.listen(5000, () => console.log("Engine active on port 5000"));