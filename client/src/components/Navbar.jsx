import { Link, useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";
import PingIndicator from "./PingIndicator";
import JoinRequestBell from "./JoinRequestBell";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MODES = [
  { key: "editor", label: "Editor" },
  { key: "split", label: "Split" },
  { key: "whiteboard", label: "Whiteboard" },
];

function Navbar({ roomId, mode, onModeChange, onOpenReplay, isAdmin, pendingRequests, onApproveJoin, onDenyJoin }) {
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const modeRefs = useRef({});
  const [indicatorRect, setIndicatorRect] = useState({ left: 3, width: 0 });

  const measureIndicator = () => {
    const btn = modeRefs.current[mode];
    if (btn) {
      setIndicatorRect({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  };

useLayoutEffect(measureIndicator, [mode]);

useEffect(() => {
  window.addEventListener("resize", measureIndicator);
  return () => window.removeEventListener("resize", measureIndicator);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mode]);

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


  return (
    <>
      <div className="navbar">
        <Link to="/" className="navbar__brand">
          <Logo />
          <h2> SyncSpace </h2>
        </Link>

        {roomId && onModeChange && (
          <div className="mode-toggle">
            <span
              className="mode-toggle__indicator"
              style={{ left: `${indicatorRect.left}px`, width: `${indicatorRect.width}px` }}
            />

            {MODES.map((m) => (
              <button
                key={m.key}
                ref={(el) => (modeRefs.current[m.key] = el)}
                className={`mode-toggle__btn ${mode === m.key ? "is-active" : ""}`}
                onClick={() => onModeChange(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="navbar__actions">
          {isAdmin && pendingRequests && (
          <JoinRequestBell requests={pendingRequests} onApprove={onApproveJoin} onDeny={onDenyJoin} />
          )}
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

            <label>Room ID</label>

            <div className="share-field">
              <input value={roomId} readOnly />
              <button onClick={copyMeetingId}>
                Copy
              </button>
            </div>

            <label>Room Link</label>

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