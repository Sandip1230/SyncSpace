import "./Settings.css";

export default function Settings({ open, settings, onChange, onReset, onClose }) {
  if (!open) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel__header">
          <h2>Settings</h2>
          <button className="settings-panel__close" onClick={onClose} aria-label="Close settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="settings-panel__body">
          <section className="settings-section">
            <h3>Appearance</h3>
            <label className="settings-row">
              <span>
                UI text size
                <small>Scales the whole interface, including the editor chrome.</small>
              </span>
              <span className="settings-row__control">
                <input
                  type="range"
                  min="0.85"
                  max="1.3"
                  step="0.05"
                  value={settings.fontScale}
                  onChange={(e) => onChange({ fontScale: Number(e.target.value) })}
                />
                <span className="settings-row__value">{Math.round(settings.fontScale * 100)}%</span>
              </span>
            </label>
          </section>

          <section className="settings-section">
            <h3>Editor</h3>
            <label className="settings-row">
              <span>Editor font size</span>
              <span className="settings-row__control">
                <input
                  type="range"
                  min="11"
                  max="18"
                  step="0.5"
                  value={settings.editorFontSize}
                  onChange={(e) => onChange({ editorFontSize: Number(e.target.value) })}
                />
                <span className="settings-row__value">{settings.editorFontSize}px</span>
              </span>
            </label>
            <label className="settings-row settings-row--toggle">
              <span>Minimap</span>
              <input
                type="checkbox"
                checked={settings.editorMinimap}
                onChange={(e) => onChange({ editorMinimap: e.target.checked })}
              />
            </label>
            <label className="settings-row settings-row--toggle">
              <span>Word wrap</span>
              <input
                type="checkbox"
                checked={settings.editorWordWrap}
                onChange={(e) => onChange({ editorWordWrap: e.target.checked })}
              />
            </label>
          </section>

          <section className="settings-section">
            <h3>Run &amp; Terminal</h3>
            <label className="settings-row">
              <span>
                Execution timeout
                <small>Auto-stops runaway loops in the in-browser JS/TS sandbox.</small>
              </span>
              <span className="settings-row__control">
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="1000"
                  value={settings.runTimeoutMs}
                  onChange={(e) => onChange({ runTimeoutMs: Number(e.target.value) })}
                />
                <span className="settings-row__value">{(settings.runTimeoutMs / 1000).toFixed(0)}s</span>
              </span>
            </label>
          </section>

          <section className="settings-section">
            <h3>Whiteboard defaults</h3>
            <label className="settings-row">
              <span>Default color</span>
              <span className="settings-row__control">
                <input
                  type="color"
                  value={settings.whiteboardDefaultColor}
                  onChange={(e) => onChange({ whiteboardDefaultColor: e.target.value })}
                />
              </span>
            </label>
            <label className="settings-row">
              <span>Default stroke width</span>
              <span className="settings-row__control">
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={settings.whiteboardDefaultStrokeWidth}
                  onChange={(e) => onChange({ whiteboardDefaultStrokeWidth: Number(e.target.value) })}
                />
                <span className="settings-row__value">{settings.whiteboardDefaultStrokeWidth}px</span>
              </span>
            </label>
          </section>
        </div>

        <div className="settings-panel__footer">
          <button className="settings-reset" onClick={onReset}>
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
