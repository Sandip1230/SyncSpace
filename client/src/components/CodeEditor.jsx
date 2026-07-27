import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { FileIcon } from "./FileExplorer";
import Terminal from "./Terminal";
import { isRunnable } from "../lib/fileTree";
import "./CodeEditor.css";

function CodeEditor({fileSystem, awareness }) {
  const { activeFile, activeFileId, activeText } = fileSystem;
  const bindingRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [monacoInstance, setMonacoInstance] = useState(null);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runRequest, setRunRequest] = useState(null);

  const language = activeFile?.language || "plaintext";
  const runnable = isRunnable(language);

  const handleMount = (editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
  };

  useEffect(() => {
    if (!editorInstance || !monacoInstance || !activeText || !awareness) return undefined;

    bindingRef.current?.destroy();
    const model = editorInstance.getModel();
    monacoInstance.editor.setModelLanguage(model, language);
    bindingRef.current = new MonacoBinding(activeText, model, new Set([editorInstance]), awareness);

    return () => bindingRef.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorInstance, monacoInstance, activeFileId, activeText, awareness]);

  useEffect(() => () => bindingRef.current?.destroy(), []);

  const handleRun = () => {
    if (!activeText || !runnable) return;
    setRunRequest({ code: activeText.toString(), language, token: Date.now() });
    setTerminalOpen(true);
  };

  return (
    <div className="code-editor">
      <div className="code-editor__tabbar">
        <div className="code-editor__file-label">
          {activeFile && <FileIcon name={activeFile.name} size={14} />}
          <span>{activeFile ? activeFile.name : "No file open — select one from the explorer"}</span>
        </div>
        <div className="code-editor__tools">
          <button className="btn-run" onClick={handleRun} disabled={!runnable} title={runnable ? "Run in-browser" : "JS/TS only"}>▶ Run</button>
          <button className={`btn-terminal ${terminalOpen ? "is-active" : ""}`} onClick={() => setTerminalOpen((v) => !v)}>Terminal</button>
        </div>
      </div>

      <div className="code-editor__surface">
        {activeText ? (
          <Editor
            key={activeFileId}
            language={language}
            theme="vs-dark"
            onMount={handleMount}
            options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false }, smoothScrolling: true, padding: { top: 12 } }}
          />
        ) : (
          <div className="code-editor__empty">Select a file from the explorer to start editing.</div>
        )}
      </div>

      {terminalOpen && (
        <div className="code-editor__terminal">
          <Terminal code={runRequest?.code ?? ""} language={runRequest?.language ?? language} autoRunToken={runRequest?.token} onClose={() => setTerminalOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default CodeEditor;