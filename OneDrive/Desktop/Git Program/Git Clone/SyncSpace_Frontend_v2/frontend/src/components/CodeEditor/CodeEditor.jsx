import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness.js";
import FileExplorer from "../FileExplorer/FileExplorer";
import Terminal from "../Terminal/Terminal";
import { isRunnable } from "../../lib/fileTree";
import "./CodeEditor.css";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "css", label: "CSS" },
  { id: "html", label: "HTML" },
  { id: "plaintext", label: "Plain Text" },
];

const THEME_NAME = "syncspace-dark";

function defineTheme(monaco) {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6f80a3", fontStyle: "italic" },
      { token: "keyword", foreground: "3fc6d6" },
      { token: "string", foreground: "3ddc97" },
      { token: "number", foreground: "f2b134" },
    ],
    colors: {
      "editor.background": "#0b1526",
      "editor.foreground": "#e7edf7",
      "editor.lineHighlightBackground": "#121e3699",
      "editor.selectionBackground": "#3fc6d640",
      "editorCursor.foreground": "#3fc6d6",
      "editorLineNumber.foreground": "#3a4a6b",
      "editorLineNumber.activeForeground": "#a9b8d4",
      "editorGutter.background": "#0b1526",
      "editorWhitespace.foreground": "#1c2c4a",
      "scrollbarSlider.background": "#2c3f6680",
      "scrollbarSlider.hoverBackground": "#2c3f66c0",
    },
  });
}

export default function CodeEditor({ ydoc, fileTreeMap, fileSystem, settings, onOpenAnnotate }) {
  const { activeFile, activeFileId, activeText, entries } = fileSystem;

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const awarenessRef = useRef(null);

  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [runRequest, setRunRequest] = useState(null);

  const language = activeFile?.language || "plaintext";
  const runnable = isRunnable(language);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    defineTheme(monaco);
    monaco.editor.setTheme(THEME_NAME);
    awarenessRef.current = new Awareness(ydoc);

    editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });

    editor.focus();
  };

  // Rebind Monaco to whichever file is active. Both the editor instance and
  // its underlying model stay mounted the whole time — only the Y.Text
  // source (and the model's language) change when the person switches files.
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !activeText) return undefined;

    bindingRef.current?.destroy();
    bindingRef.current = null;

    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, language);
    bindingRef.current = new MonacoBinding(activeText, model, new Set([editor]), awarenessRef.current);

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId, activeText]);

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      awarenessRef.current?.destroy();
    };
  }, []);

  const handleRun = () => {
    if (!activeText || !runnable) return;
    setRunRequest({ code: activeText.toString(), language, token: Date.now() });
    setTerminalOpen(true);
  };

  return (
    <div className={`code-editor ${explorerOpen ? "has-explorer" : ""} ${terminalOpen ? "has-terminal" : ""}`}>
      {explorerOpen && (
        <FileExplorer
          fileSystem={fileSystem}
          fileTreeMap={fileTreeMap}
          ydoc={ydoc}
          onCollapse={() => setExplorerOpen(false)}
        />
      )}

      <div className="code-editor__main">
        <div className="code-editor__tabbar">
          <div className="code-editor__tabs">
            {!explorerOpen && (
              <button className="icon-btn" title="Show explorer" aria-label="Show explorer" onClick={() => setExplorerOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <div className="code-tab is-active">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9.4 16.6L4.8 12l4.6-4.6M14.6 7.4l4.6 4.6-4.6 4.6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {activeFile ? activeFile.name : "No file open"}
            </div>
          </div>

          <div className="code-editor__tools">
            <label className="lang-select">
              <select
                value={language}
                disabled={!activeFile}
                onChange={(e) => fileSystem.setLanguage(activeFileId, e.target.value)}
                aria-label="Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="btn-run"
              onClick={handleRun}
              disabled={!runnable}
              title={runnable ? "Run in-browser (JS/TS)" : "Run supports JavaScript/TypeScript files only"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 4l14 8-14 8V4z" fill="currentColor" />
              </svg>
              Run
            </button>

            <button
              className={`btn-terminal ${terminalOpen ? "is-active" : ""}`}
              onClick={() => setTerminalOpen((v) => !v)}
              title="Toggle terminal"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6 9l4 3-4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Terminal
            </button>

            <button className="btn-annotate" onClick={onOpenAnnotate}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
              Annotate
            </button>
          </div>
        </div>

        <div className="code-editor__surface">
          <Editor
            language={language}
            theme={THEME_NAME}
            onMount={handleMount}
            options={{
              fontSize: settings.editorFontSize,
              fontFamily:
                "ui-monospace, 'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: settings.editorMinimap },
              wordWrap: settings.editorWordWrap ? "on" : "off",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {terminalOpen && (
          <div className="code-editor__terminal">
            <Terminal
              code={runRequest?.code ?? ""}
              language={runRequest?.language ?? language}
              timeoutMs={settings.runTimeoutMs}
              autoRunToken={runRequest?.token}
              onClose={() => setTerminalOpen(false)}
            />
          </div>
        )}

        <div className="code-editor__statusbar">
          <span>Ln {cursor.line}, Col {cursor.col}</span>
          <span className="statusbar__divider" />
          <span>{LANGUAGES.find((l) => l.id === language)?.label}</span>
          <span className="statusbar__divider" />
          <span>UTF-8</span>
          <span className="statusbar__divider" />
          <span>{entries.filter((e) => e.type === "file").length} file(s)</span>
          <span className="statusbar__spacer" />
          <span className="statusbar__hint">Yjs CRDT sync active · saved locally</span>
        </div>
      </div>
    </div>
  );
}
