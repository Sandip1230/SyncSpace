import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import Whiteboard from "./components/Whiteboard";
import CodeEditor from "./components/CodeEditor";
import { useSocket } from "./hooks/useSocket";
import { useYDoc } from "./hooks/useYDoc";

function App() {
  // Placeholder until CreateRoom/JoinRoom pages are wired to routing.
  const [roomId] = useState("demo-room");
  const [username] = useState("Guest-" + Math.floor(Math.random() * 1000));

  const { connected, users } = useSocket(roomId, username);
  const { ydoc, ytext } = useYDoc(roomId);

  return (
    <>
      <Navbar />

      <div style={{ display: "flex", height: "90vh" }}>
        <Sidebar />

        <div style={{ flex: 1 }}>
          <Toolbar />
          <Whiteboard />
        </div>

        <CodeEditor ytext={ytext} ydoc={ydoc} />
      </div>

      <div style={{ position: "fixed", bottom: 8, right: 12, fontSize: 12, color: connected ? "green" : "red" }}>
        {connected ? `Connected · ${users.length} online` : "Disconnected"}
      </div>
    </>
  );
}

export default App;