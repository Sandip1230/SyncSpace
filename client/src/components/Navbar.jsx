import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";
import PingIndicator from "./PingIndicator";

const MODES = [
  { key: "editor", label: "Editor" },
  { key: "split", label: "Split" },
  { key: "whiteboard", label: "Whiteboard" },
];

function Navbar({ roomId, mode, onModeChange, onOpenReplay }) {
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const meetingLink = window.location.href;

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeIndex = Math.max(
    0,
    MODES.findIndex((m) => m.key === mode)
  );

  return (
    <>
      <div className="navbar">
        <Link to="/" className="navbar__brand">
          <Logo />
          <h2>SyncSpace</h2>
        </Link>

        {roomId && onModeChange && (
          <div
            className="mode-toggle"
            style={{
              "--mode-count": MODES.length,
              "--mode-index": activeIndex,
            }}
          >
            <span className="mode-toggle__indicator" />

            {MODES.map((m) => (
              <button
                key={m.key}
                className={`mode-toggle__btn ${
                  mode === m.key ? "is-active" : ""
                }`}
                onClick={() => onModeChange(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="navbar__actions">
          <PingIndicator />
          <ThemeToggle />

          <button
            className="navbar__btn navbar__btn--icon"
            onClick={() => navigate("/settings")}
          >
            <FiSettings />
            <span>Settings</span>
          </button>

          <button
            className="navbar__btn"
            onClick={() => navigate("/create")}
          >
            Create Room
          </button>

          <button
            className="navbar__btn"
            onClick={() => navigate("/join")}
          >
            Join Room
          </button>

          {roomId && onOpenReplay && (
            <button
              className="navbar__btn"
              onClick={onOpenReplay}
            >
              Replay
            </button>
          )}

          {roomId && (
            <button
              className="navbar__btn navbar__btn--accent"
              onClick={handleShare}
            >
              Share
            </button>
          )}
        </div>
      </div>

      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal">
            <h2>Share Meeting</h2>

            <label>Meeting ID</label>

            <div className="share-field">
              <input value={roomId} readOnly />
              <button onClick={copyMeetingId}>
                Copy
              </button>
            </div>

            <label>Meeting Link</label>

            <div className="share-field">
              <input value={meetingLink} readOnly />
              <button onClick={copyMeetingLink}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <button
              className="close-btn"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;