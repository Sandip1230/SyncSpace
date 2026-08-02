import { useEffect, useState } from "react";
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

  useEffect(() => {
    const savedSettings = localStorage.getItem("syncspace-settings");

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      setUsername(settings.username ?? "Guest");
      setNotifications(settings.notifications ?? true);
      setAutosave(settings.autosave ?? true);
      setTheme(settings.theme ?? "Light");
      setFontSize(settings.fontSize ?? 16);
      setFontFamily(settings.fontFamily ?? "Monospace");
      setWordWrap(settings.wordWrap ?? true);
      setLineNumbers(settings.lineNumbers ?? true);
      setMiniMap(settings.miniMap ?? true);
      setShowOnlineUsers(settings.showOnlineUsers ?? true);
      setShowGrid(settings.showGrid ?? true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const settings = {
      username,
      notifications,
      autosave,
      theme,
      fontSize,
      fontFamily,
      wordWrap,
      lineNumbers,
      miniMap,
      showOnlineUsers,
      showGrid,
    };

    localStorage.setItem(
      "syncspace-settings",
      JSON.stringify(settings)
    );

    setSaved(true);
  };

  return (
    <div className="settings">
      <div className="settings-card">

        <button
          className="back-btn"
          type="button"
          onClick={() => navigate(-1)}
        >
          ← Back to Editor
        </button>

        <div className="settings-header">
          <p className="settings-eyebrow">Preferences</p>
          <h1>⚙️ Settings</h1>
          <p className="settings-description">
            Customize your workspace experience and keep everything running smoothly.
          </p>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>

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
                onChange={() => setShowOnlineUsers(!showOnlineUsers)}
              />
              <span>
                <strong>Show Online Users</strong>
                <small>Display connected collaborators.</small>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={autosave}
                onChange={() => setAutosave(!autosave)}
              />
              <span>
                <strong>Enable Auto Save</strong>
                <small>Automatically save your work.</small>
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
                <small>Wrap long lines in the editor.</small>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={() => setLineNumbers(!lineNumbers)}
              />
              <span>
                <strong>Show Line Numbers</strong>
                <small>Display editor line numbers.</small>
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
                <small>Display Monaco editor minimap.</small>
              </span>
            </label>
          </div>

          <div className="settings-group toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={() => setShowGrid(!showGrid)}
              />
              <span>
                <strong>Show Whiteboard Grid</strong>
                <small>Display grid on the whiteboard.</small>
              </span>
            </label>
          </div>

          <div className="settings-actions">
            <button className="save-btn" type="submit">
              Save Settings
            </button>

            <button
              type="button"
              className="reset-btn"
              onClick={() => {
                localStorage.removeItem("syncspace-settings");
                window.location.reload();
              }}
            >
              Reset Settings
            </button>
          </div>

          {saved && (
            <p className="save-message">
              ✅ Settings saved successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}