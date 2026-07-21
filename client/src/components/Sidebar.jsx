import { useState } from "react";
import "./Sidebar.css";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

function Sidebar({ roomId, users = [], connected }) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard?.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sidebar">
      <div className="sidebar__section-label">Room</div>
      <div className="sidebar__room-row">
        <code className="sidebar__room-id">{roomId}</code>
        <button className={`sidebar__copy-btn ${copied ? "is-copied" : ""}`} onClick={copyRoomId} title="Copy room ID">
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Copied
            </>
          ) : "Copy"}
        </button>
      </div>
      <div className="sidebar__status">
        <span className={`sidebar__status-dot ${connected ? "is-live" : "is-offline"}`} />
        {connected ? "Live" : "Offline"}
      </div>

      <div className="sidebar__section-label">Online ({users.length})</div>
      {users.length === 0 && <div className="sidebar__empty">Just you, for now.</div>}
      <div className="sidebar__users">
        {users.map((u) => (
          <div key={u.socketId} className="sidebar__user fade-in">
            <span className="sidebar__avatar" style={{ background: stringToColor(u.socketId) }}>
              {(u.username || "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="sidebar__username">{u.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;