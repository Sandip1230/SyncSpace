import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness.js";

function CodeEditor({ ytext, ydoc }) {
  const bindingRef = useRef(null);
  const awarenessRef = useRef(null);

  const handleMount = (editor, monaco) => {
    if (!ytext || !ydoc) return;
    awarenessRef.current = new Awareness(ydoc);
    bindingRef.current = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      awarenessRef.current
    );
  };

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      awarenessRef.current?.destroy();
    };
  }, []);

  return (
    <div style={{ height: "100%", width: "40%" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleMount}
      />
    </div>
  );
}

export default CodeEditor;