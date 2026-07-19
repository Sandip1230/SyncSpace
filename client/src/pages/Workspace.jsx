import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Toolbar from "../components/Toolbar";
import Whiteboard from "../components/Whiteboard";
import CodeEditor from "../components/CodeEditor";
import Toast from "../components/Toast";
import { useSocket } from "../hooks/useSocket";
import { useYDoc } from "../hooks/useYDoc";
import { clearShapes } from "../lib/yShapes";
import { getStoredUsername, randomGuestName } from "../utils/helper";
import "../components/Navbar.css";

function Workspace() {
  const { roomId } = useParams();
  const [username] = useState(getStoredUsername() || randomGuestName());

  const { connecting, users, error } = useSocket(roomId, username);
  const { ydoc, ytext, yshapes, undoManager } = useYDoc(roomId);

  const [mode, setMode] = useState("split");
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#3fc6d6");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [dismissedError, setDismissedError] = useState(false);

  return (
    <>
      <Navbar roomId={roomId} mode={mode} onModeChange={setMode} />

      {connecting && !error && (
        <div style={{ position: "fixed", top: 68, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "var(--text-secondary)" }} className="fade-in">
          Connecting…
        </div>
      )}

      <div className={`workspace-stage stage--${mode}`}>
        <Sidebar roomId={roomId} users={users} connected={!connecting} />

        <div className="workspace-panel workspace-panel--editor">
          <CodeEditor ytext={ytext} ydoc={ydoc} />
        </div>

        <div className="workspace-panel workspace-panel--whiteboard">
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
            onClose={() => setMode("editor")}
          />
          <Whiteboard yshapes={yshapes} tool={tool} color={color} strokeWidth={strokeWidth} />
        </div>
      </div>

      {!dismissedError && (
        <Toast message={error} tone="error" onDismiss={() => setDismissedError(true)} />
      )}
    </>
  );
}

export default Workspace;