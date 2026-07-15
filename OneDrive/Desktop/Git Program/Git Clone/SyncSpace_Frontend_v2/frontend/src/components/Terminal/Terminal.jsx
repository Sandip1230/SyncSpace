import { useEffect, useRef, useState } from "react";
import { runCode } from "../../lib/runCode";
import "./Terminal.css";

export default function Terminal({ code, language, timeoutMs, onClose, autoRunToken }) {
  const [lines, setLines] = useState([]);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(null);
  const controllerRef = useRef(null);
  const startRef = useRef(0);
  const bodyRef = useRef(null);

  const append = (kind, args) => {
    setLines((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, kind, text: args.join(" "), t: Date.now() },
    ]);
  };

  const stop = () => {
    controllerRef.current?.stop();
  };

  const run = () => {
    if (running) return;
    setLines([]);
    setElapsedMs(null);
    setRunning(true);
    startRef.current = performance.now();
    append("meta", [`▶ running ${language}…`]);
    controllerRef.current = runCode(code, language, {
      timeoutMs,
      onMessage: (msg) => append(msg.kind, msg.args),
      onDone: (reason) => {
        setRunning(false);
        const ms = Math.round(performance.now() - startRef.current);
        setElapsedMs(ms);
        if (reason === "complete") append("meta", [`✓ finished in ${ms}ms`]);
      },
    });
  };

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  // Fires when the parent's "Run" button is clicked (see CodeEditor).
  useEffect(() => {
    if (autoRunToken) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunToken]);

  useEffect(() => () => controllerRef.current?.stop(), []);

  return (
    <div className="terminal">
      <div className="terminal__bar">
        <span className="terminal__title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
            <path d="M6 9l4 3-4 3M12 15h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Terminal
          {elapsedMs != null && <span className="terminal__timing">{elapsedMs}ms · in-browser, no network round trip</span>}
        </span>
        <div className="terminal__actions">
          <button className="terminal__btn" onClick={run} disabled={running} title="Run">
            Run
          </button>
          <button className="terminal__btn" onClick={stop} disabled={!running} title="Stop">
            Stop
          </button>
          <button className="terminal__btn" onClick={() => setLines([])} title="Clear">
            Clear
          </button>
          {onClose && (
            <button className="terminal__btn terminal__btn--icon" onClick={onClose} title="Close terminal" aria-label="Close terminal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      </div>
      <div className="terminal__body" ref={bodyRef}>
        {lines.length === 0 && !running && (
          <div className="terminal__hint">Press Run to execute this file in a sandboxed browser worker. JavaScript and TypeScript only.</div>
        )}
        {lines.map((l) => (
          <div key={l.id} className={`terminal__line terminal__line--${l.kind}`}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
