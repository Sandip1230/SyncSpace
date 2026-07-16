const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Test client connected:', socket.id);

  socket.emit('space:join', { spaceId: 'room1', username: 'TestUser' });
});

socket.on('space:user-joined', (data) => {
  console.log('User joined event received:', data);
});

socket.on('disconnect', () => {
  console.log('Test client disconnected');
});