import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness.js";
import { SiJavascript, SiTypescript, SiPython, SiJson, SiMarkdown, SiCss3, SiHtml5 } from "react-icons/si";
import Terminal from "./Terminal";
import "./CodeEditor.css";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", Icon: SiJavascript, color: "#f2b134" },
  { id: "typescript", label: "TypeScript", Icon: SiTypescript, color: "#3fc6d6" },
  { id: "python", label: "Python", Icon: SiPython, color: "#3ddc97" },
  { id: "json", label: "JSON", Icon: SiJson, color: "#c77dff" },
  { id: "markdown", label: "Markdown", Icon: SiMarkdown, color: "#a9b8d4" },
  { id: "css", label: "CSS", Icon: SiCss3, color: "#ff6b6b" },
  { id: "html", label: "HTML", Icon: SiHtml5, color: "#f2b134" },
];

const RUNNABLE = ["javascript", "typescript"];

function CodeEditor({ ytext, ydoc }) {
  const editorRef = useRef(null);
  const bindingRef = useRef(null);
  const awarenessRef = useRef(null);

  const [language, setLanguage] = useState("javascript");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runRequest, setRunRequest] = useState(null);

  const activeLang = LANGUAGES.find((l) => l.id === language);
  const runnable = RUNNABLE.includes(language);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    if (!ytext || !ydoc) return;
    awarenessRef.current = new Awareness(ydoc);
    bindingRef.current = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), awarenessRef.current);
  };

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      awarenessRef.current?.destroy();
    };
  }, []);

  const handleRun = () => {
    if (!runnable || !editorRef.current) return;
    setRunRequest({ code: editorRef.current.getValue(), language, token: Date.now() });
    setTerminalOpen(true);
  };

  return (
    <div className="code-editor">
      <div className="code-editor__tabbar">
        <div className="code-editor__lang-select">
          {activeLang && <activeLang.Icon size={14} color={activeLang.color} />}
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="code-editor__tools">
          <button className="btn-run" onClick={handleRun} disabled={!runnable} title={runnable ? "Run in-browser" : "Run supports JavaScript/TypeScript only"}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 4l14 8-14 8V4z" fill="currentColor" /></svg>
            Run
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
          options={{
            automaticLayout: true, // resizes with its container instead of freezing at mount size
            fontSize: 14,
            minimap: { enabled: false },
            smoothScrolling: true,
            padding: { top: 12 },
          }}
        />
      </div>

      {terminalOpen && (
        <div className="code-editor__terminal">
          <Terminal
            code={runRequest?.code ?? ""}
            language={runRequest?.language ?? language}
            autoRunToken={runRequest?.token}
            onClose={() => setTerminalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default CodeEditor;