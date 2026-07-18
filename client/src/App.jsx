import { useCallback, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Toolbar from "./components/Toolbar";
import Whiteboard from "./components/Whiteboard";
import CodeEditor from "./components/CodeEditor";
import { useSocket } from "./hooks/useSocket";
import { useYDoc } from "./hooks/useYDoc";

function App() {
  const [roomId] = useState("demo-room");
  const [username] = useState("Guest-" + Math.floor(Math.random() * 1000));

  const { connected, users } = useSocket(roomId, username);
  const { ydoc, ytext, yshapes } = useYDoc(roomId);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#3fc6d6");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const actionsRef = useRef({});
  const registerActions = useCallback((actions) => { actionsRef.current = actions; }, []);

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", height: "90vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Toolbar
            tool={tool}
            onToolChange={setTool}
            color={color}
            onColorChange={setColor}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            onUndo={() => actionsRef.current.onUndo?.()}
            onRedo={() => {}}
            onClear={() => actionsRef.current.onClear?.()}
            onClose={() => {}}
          />
          <Whiteboard yshapes={yshapes} tool={tool} color={color} strokeWidth={strokeWidth} registerActions={registerActions} />
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