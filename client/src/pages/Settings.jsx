import { useState } from "react";
import "./Settings.css";

export default function Settings() {
  const [username, setUsername] = useState("Guest");
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="settings">
      <div className="settings-card">
        <div className="settings-header">
          <p className="settings-eyebrow">Preferences</p>
          <h1>⚙️ Settings</h1>
          <p className="settings-description">
            Customize your workspace experience and keep everything running smoothly.
          </p>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
            />
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
                <small>Get updates about activity and reminders.</small>
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
                <small>Automatically save your work as you edit.</small>
              </span>
            </label>
          </div>

          <button className="save-btn" type="submit">
            Save Settings
          </button>

          {saved && <p className="save-message">Settings saved successfully!</p>}
        </form>
      </div>
    </div>
  );
}
