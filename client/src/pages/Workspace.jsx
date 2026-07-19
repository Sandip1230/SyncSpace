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
import { useFileSystem } from "../hooks/useFileSystem";
import { clearShapes } from "../lib/yShapes";
import { getStoredUsername, randomGuestName } from "../utils/helper";
import "../components/Navbar.css";

function Workspace() {
  const { roomId } = useParams();
  const [username] = useState(getStoredUsername() || randomGuestName());

  const { connecting, users, error } = useSocket(roomId, username);
  const { ydoc, fileTreeMap, yshapes, undoManager } = useYDoc(roomId);
  const fileSystem = useFileSystem(ydoc, fileTreeMap);

  const [mode, setMode] = useState("split");
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#3fc6d6");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [dismissedError, setDismissedError] = useState(false);

  return (
    <>
      <Navbar roomId={roomId} mode={mode} onModeChange={setMode} />

      {connecting ? (
        <div className="workspace-skeleton">
          <div className="workspace-skeleton__bar" />
          <div className="workspace-skeleton__panels">
            <div className="workspace-skeleton__panel" />
            <div className="workspace-skeleton__panel" />
          </div>
        </div>
      ) : (
        <div className={`workspace-stage stage--${mode}`}>
          <Sidebar roomId={roomId} users={users} connected={!connecting} />

          <div className="workspace-panel workspace-panel--editor">
            <CodeEditor ydoc={ydoc} fileSystem={fileSystem} />
          </div>

          <div className="workspace-panel workspace-panel--whiteboard">
            <Toolbar tool={tool} onToolChange={setTool} color={color} onColorChange={setColor} strokeWidth={strokeWidth} onStrokeWidthChange={setStrokeWidth} onUndo={() => undoManager.undo()} onRedo={() => undoManager.redo()} onClear={() => clearShapes(yshapes)} onClose={() => setMode("editor")} />
            <Whiteboard yshapes={yshapes} tool={tool} color={color} strokeWidth={strokeWidth} />
          </div>
        </div>
      )}

      {!dismissedError && <Toast message={error} tone="error" onDismiss={() => setDismissedError(true)} />}
    </>
  );
}

export default Workspace;