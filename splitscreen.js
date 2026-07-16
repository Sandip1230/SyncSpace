// App.jsx (React UI Scaffold)
import React, { useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  useEffect(() => {
    const mockSpaceId = "interview-room-xyz";
    const mockUser = "AllRounder_Dev";

    socket.emit('space:join', { spaceId: mockSpaceId, username: mockUser });

    socket.on('space:user-joined', (data) => {
      console.log(`Teammate active: ${data.username} via socket ${data.socketId}`);
    });

    return () => {
      socket.off('space:user-joined');
    };
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* LEFT PANE: Collaborative Whiteboard Placeholder */}
      <div style={{ flex: 1, backgroundColor: '#f8f9fa', borderRight: '2px solid #dee2e6', padding: '1rem' }}>
        <h3>Interactive Whiteboard Pane (Konva.js Placeholder)</h3>
        <p>Status: Structural Shell Initialized</p>
      </div>

      {/* RIGHT PANE: Code Editor Placeholder */}
      <div style={{ flex: 1, backgroundColor: '#1e1e1e', color: '#ffffff', padding: '1rem' }}>
        <h3>Monaco Code Editor Pane (VS Code Engine Placeholder)</h3>
        <p style={{ color: '#888' }}>Status: Structural Shell Initialized</p>
      </div>
    </div>
  );
}

export default App;
