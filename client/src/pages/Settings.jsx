import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("Guest");
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(true);

  const [theme, setTheme] = useState("Light");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Monospace");
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [miniMap, setMiniMap] = useState(true);
  const [showOnlineUsers, setShowOnlineUsers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="settings">
      <div className="settings-card">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back to Editor
        </button>

        <div className="settings-header">
          <p className="settings-eyebrow">Preferences</p>
          <h1>⚙️ Settings</h1>
          <p className="settings-description">
            Customize your workspace experience and keep everything running
            smoothly.
          </p>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>

          {/* General */}

          <div className="settings-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Font Size</label>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
            <small>{fontSize}px</small>
          </div>

          <div className="settings-group">
            <label>Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <option>Monospace</option>
              <option>Fira Code</option>
              <option>JetBrains Mono</option>
              <option>Consolas</option>
            </select>
          </div>

          {/* Collaboration */}

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span>
                <strong>Enable Notifications</strong>
                <small>Receive activity updates.</small>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showOnlineUsers}
                onChange={() =>
                  setShowOnlineUsers(!showOnlineUsers)
                }
              />
              <span>
                <strong>Show Online Users</strong>
                <small>Display connected collaborators.</small>
              </span>
            </label>
          </div>

          {/* Editor */}

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={autosave}
                onChange={() => setAutosave(!autosave)}
              />
              <span>
                <strong>Enable Auto Save</strong>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={() => setWordWrap(!wordWrap)}
              />
              <span>
                <strong>Word Wrap</strong>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={() =>
                  setLineNumbers(!lineNumbers)
                }
              />
              <span>
                <strong>Show Line Numbers</strong>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={miniMap}
                onChange={() => setMiniMap(!miniMap)}
              />
              <span>
                <strong>Show Mini Map</strong>
              </span>
            </label>
          </div>

          {/* Whiteboard */}

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={() => setShowGrid(!showGrid)}
              />
              <span>
                <strong>Show Whiteboard Grid</strong>
              </span>
            </label>
          </div>

          <button className="save-btn" type="submit">
            Save Settings
          </button>

          {saved && (
            <p className="save-message">
              Settings saved successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}