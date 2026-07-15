import { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import CodeEditor from "../CodeEditor/CodeEditor";
import Whiteboard from "../Whiteboard/Whiteboard";
import Settings from "../Settings/Settings";
import { useSocket } from "../../hooks/useSocket";
import { useYDoc } from "../../hooks/useYDoc";
import { useFileSystem } from "../../hooks/useFileSystem";
import { useSettings } from "../../hooks/useSettings";
import { attachSocketYjsProvider } from "../../lib/socketYjsProvider";
import "./AppShell.css";

export default function AppShell() {
  const [mode, setMode] = useState("code"); // "code" | "split" | "annotate"
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { socket, roomId, connected, peerCount } = useSocket();
  const { ydoc, fileTreeMap, shapesMap } = useYDoc(roomId);
  const fileSystem = useFileSystem(ydoc, fileTreeMap);
  const { settings, update: updateSettings, reset: resetSettings } = useSettings();

  useEffect(() => {
    const detach = attachSocketYjsProvider(ydoc, socket, roomId);
    return detach;
  }, [ydoc, socket, roomId]);

  const openAnnotate = useCallback(() => setMode("annotate"), []);
  const backToCode = useCallback(() => setMode("code"), []);

  // Esc always returns to the code view, from split or annotate.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (settingsOpen) setSettingsOpen(false);
        else if (mode !== "code") backToCode();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, backToCode, settingsOpen]);

  // Both panels stay mounted at all times so editor state (Monaco cursor,
  // undo stack) and whiteboard state (Konva stage, in-progress draft) are
  // never torn down when switching modes — only their allotted space
  // changes. The inactive panel is collapsed to 0 width/height and
  // clipped with overflow:hidden rather than unmounted.
  return (
    <div className="app-shell">
      <Header
        mode={mode}
        onModeChange={(m) => setMode(m)}
        roomId={roomId}
        connected={connected}
        peerCount={peerCount}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className={`app-shell__stage stage--${mode}`}>
        <div className="stage-panel stage-panel--code" aria-hidden={mode === "annotate"}>
          <CodeEditor
            ydoc={ydoc}
            fileTreeMap={fileTreeMap}
            fileSystem={fileSystem}
            settings={settings}
            onOpenAnnotate={openAnnotate}
          />
        </div>

        <div className="stage-panel stage-panel--board" aria-hidden={mode === "code"}>
          <Whiteboard
            shapesMap={shapesMap}
            ydoc={ydoc}
            onClose={backToCode}
            defaultColor={settings.whiteboardDefaultColor}
            defaultStrokeWidth={settings.whiteboardDefaultStrokeWidth}
          />
        </div>
      </main>

      <Settings
        open={settingsOpen}
        settings={settings}
        onChange={updateSettings}
        onReset={resetSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
