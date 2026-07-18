import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import Whiteboard from "./components/Whiteboard";
import CodeEditor from "./components/CodeEditor";
import { useSocket } from "./hooks/useSocket";
import { useYDoc } from "./hooks/useYDoc";
import { clearShapes } from "./lib/yShapes";

function App() {
  const [roomId] = useState("demo-room");
  const [username] = useState("Guest-" + Math.floor(Math.random() * 1000));

  const { connected, users } = useSocket(roomId, username);
  const { ydoc, ytext, yshapes, undoManager } = useYDoc(roomId);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#3fc6d6");
  const [strokeWidth, setStrokeWidth] = useState(4);

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", height: "90vh" }}>
        <Sidebar roomId={roomId} users={users} connected={connected} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Toolbar
            tool={tool}
            onToolChange={setTool}
            color={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            onUndo={() => undoManager.undo()}
            onRedo={() => undoManager.redo()}
            onClear={() => clearShapes(yshapes)}
            onClose={() => {}}
          />
          <Whiteboard yshapes={yshapes} tool={tool} color={color} strokeWidth={strokeWidth} />
        </div>

        <CodeEditor ytext={ytext} ydoc={ydoc} />
      </div>
    </>
  );
}

export default App;