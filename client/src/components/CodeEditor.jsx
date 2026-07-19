import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness.js";
import FileExplorer from "./FileExplorer";
import Terminal from "./Terminal";
import { isRunnable } from "../lib/fileTree";
import "./CodeEditor.css";

function CodeEditor({ ydoc, fileSystem }) {
  const { activeFile, activeFileId, activeText } = fileSystem;
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const awarenessRef = useRef(null);

  const [explorerOpen, setExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runRequest, setRunRequest] = useState(null);

  const language = activeFile?.language || "plaintext";
  const runnable = isRunnable(language);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    awarenessRef.current = new Awareness(ydoc);
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeText) return undefined;

    bindingRef.current?.destroy();
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, language);
    bindingRef.current = new MonacoBinding(activeText, model, new Set([editor]), awarenessRef.current);

    return () => bindingRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId, activeText]);

  useEffect(() => () => { bindingRef.current?.destroy(); awarenessRef.current?.destroy(); }, []);

  const handleRun = () => {
    if (!activeText || !runnable) return;
    setRunRequest({ code: activeText.toString(), language, token: Date.now() });
    setTerminalOpen(true);
  };

  return (
    <div className="code-editor">
      {explorerOpen && <FileExplorer fileSystem={fileSystem} onCollapse={() => setExplorerOpen(false)} />}

      <div className="code-editor__main">
        <div className="code-editor__tabbar">
          <div className="code-editor__file-label">
            {!explorerOpen && (
              <button className="fx-icon-btn" onClick={() => setExplorerOpen(true)} title="Show explorer">▶</button>
            )}
            {activeFile && <FileIcon name={activeFile.name} size={14} />}
            <span>{activeFile ? activeFile.name : "No file open"}</span>
          </div>
          <div className="code-editor__tools">
            <button className="btn-run" onClick={handleRun} disabled={!runnable} title={runnable ? "Run in-browser" : "JS/TS only"}>
              ▶ Run
            </button>
            <button className={`btn-terminal ${terminalOpen ? "is-active" : ""}`} onClick={() => setTerminalOpen((v) => !v)}>
              Terminal
            </button>
          </div>
        </div>

        <div className="code-editor__surface">
          <Editor
            language={language}
            theme="vs-dark"
            onMount={handleMount}
            options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false }, smoothScrolling: true, padding: { top: 12 } }}
          />
        </div>

        {terminalOpen && (
          <div className="code-editor__terminal">
            <Terminal code={runRequest?.code ?? ""} language={runRequest?.language ?? language} autoRunToken={runRequest?.token} onClose={() => setTerminalOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeEditor;