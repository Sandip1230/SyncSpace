import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";
import PingIndicator from "./PingIndicator";
import JoinRequestBell from "./JoinRequestBell";

const MODES = [
  { key: "editor", label: "Editor" },
  { key: "split", label: "Split" },
  { key: "whiteboard", label: "Whiteboard" },
];

function Navbar({ roomId, mode, onModeChange, onOpenReplay, isAdmin, pendingRequests, onApproveJoin, onDenyJoin }) {
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const meetingLink = window.location.href;

  const handleShare = () => setShowShareModal(true);
  const copyMeetingId = () => navigator.clipboard.writeText(roomId);
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // sliding mode-toggle indicator - measures the actual active button's box
  const modeRefs = useRef({});
  const [indicatorRect, setIndicatorRect] = useState({ left: 3, width: 0 });

  const measureIndicator = () => {
    const btn = modeRefs.current[mode];
    if (btn) setIndicatorRect({ left: btn.offsetLeft, width: btn.offsetWidth });
  };

  useLayoutEffect(measureIndicator, [mode]);
  useEffect(() => {
    window.addEventListener("resize", measureIndicator);
    return () => window.removeEventListener("resize", measureIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <>
      <div className="navbar">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo-tile">
            <Logo size={22} />
          </div>
          <span className="navbar__wordmark">SyncSpace</span>
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

          <div className="navbar__group">
            <PingIndicator />
            <ThemeToggle />
            <button className="navbar__icon-btn" title="Settings" aria-label="Settings" onClick={() => navigate("/settings")}>
              <FiSettings size={15} />
            </button>
          </div>

          <div className="navbar__divider" />

          <div className="navbar__group">
            <button className="navbar__chip" onClick={() => navigate("/create")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Create
            </button>
            <button className="navbar__chip" onClick={() => navigate("/join")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 16l-4-4 4-4M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Join
            </button>
            {roomId && onOpenReplay && (
              <button className="navbar__chip" onClick={onOpenReplay}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 103-6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M3 12V6m0 6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Replay
              </button>
            )}
          </div>

          {roomId && (
            <button className="navbar__btn navbar__btn--accent" onClick={handleShare}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
              <button onClick={copyMeetingId}>Copy</button>
            </div>

            <label>Room Link</label>
            <div className="share-field">
              <input value={meetingLink} readOnly />
              <button onClick={copyMeetingLink}>{copied ? "Copied!" : "Copy"}</button>
            </div>

            <button className="close-btn" onClick={() => setShowShareModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;