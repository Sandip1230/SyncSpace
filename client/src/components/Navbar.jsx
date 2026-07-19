import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "./Navbar.css";

const MODES = [
  { key: "editor", label: "Editor" },
  { key: "split", label: "Split" },
  { key: "whiteboard", label: "Whiteboard" },
];

function Navbar({ roomId, mode, onModeChange }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeIndex = Math.max(0, MODES.findIndex((m) => m.key === mode));

  return (
    <div className="navbar">
      <Link to="/" className="navbar__brand">
        <Logo />
        <h2>SyncSpace</h2>
      </Link>

      {roomId && onModeChange && (
        <div className="mode-toggle" style={{ "--mode-count": MODES.length, "--mode-index": activeIndex }}>
          <span className="mode-toggle__indicator" />
          {MODES.map((m) => (
            <button key={m.key} className={`mode-toggle__btn ${mode === m.key ? "is-active" : ""}`} onClick={() => onModeChange(m.key)}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="navbar__actions">
        <button className="navbar__btn" onClick={() => navigate("/create")}>Create Room</button>
        <button className="navbar__btn" onClick={() => navigate("/join")}>Join Room</button>
        {roomId && (
          <button className={`navbar__btn navbar__btn--accent ${copied ? "is-copied" : ""}`} onClick={handleShare}>
            {copied ? "Copied!" : "Share"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;