import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSettings, FiShare2, FiX, FiCopy } from "react-icons/fi";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import PingIndicator from "./PingIndicator";
import "./Navbar.css";

const MODES = [
  { key: "editor", label: "Editor" },
  { key: "split", label: "Split" },
  { key: "whiteboard", label: "Whiteboard" },
];

function Navbar({ roomId, mode, onModeChange, onOpenReplay }) {
  const navigate = useNavigate();

  const [copied, setCopied] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const meetingLink = window.location.href;

  const activeIndex = Math.max(
    0,
    MODES.findIndex((item) => item.key === mode)
  );

  // Automatically close the copied message
  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [copied]);

  // Close modal with Escape key
  useEffect(() => {
    if (!showShareModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowShareModal(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showShareModal]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copyMeetingId = () => {
    copyToClipboard(roomId, "id");
  };

  const copyMeetingLink = () => {
    copyToClipboard(meetingLink, "link");
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setCopied("");
  };

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="navbar__brand" aria-label="Go to SyncSpace home">
          <Logo />
          <h2>SyncSpace</h2>
        </Link>

        {/* Mode Switcher */}
        {roomId && onModeChange && (
          <div
            className="mode-toggle"
            style={{
              "--mode-count": MODES.length,
              "--mode-index": activeIndex,
            }}
            role="tablist"
            aria-label="Workspace mode"
          >
            <span className="mode-toggle__indicator" />

            {MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`mode-toggle__btn ${
                  mode === item.key ? "is-active" : ""
                }`}
                onClick={() => onModeChange(item.key)}
                role="tab"
                aria-selected={mode === item.key}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="navbar__actions">
          <PingIndicator />

          <ThemeToggle />

          <button
            type="button"
            className="navbar__btn navbar__btn--icon"
            onClick={() => navigate("/settings")}
            aria-label="Open settings"
          >
            <FiSettings />
            <span>Settings</span>
          </button>

          <button
            type="button"
            className="navbar__btn"
            onClick={() => navigate("/create")}
          >
            Create Room
          </button>

          <button
            type="button"
            className="navbar__btn"
            onClick={() => navigate("/join")}
          >
            Join Room
          </button>

          {roomId && onOpenReplay && (
            <button
              type="button"
              className="navbar__btn"
              onClick={onOpenReplay}
            >
              Replay
            </button>
          )}

          {roomId && (
            <button
              type="button"
              className="navbar__btn navbar__btn--accent"
              onClick={handleShare}
            >
              <FiShare2 />
              <span>Share</span>
            </button>
          )}
        </div>
      </nav>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="share-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeShareModal();
            }
          }}
        >
          <div
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            {/* Modal Header */}
            <div className="share-modal__header">
              <h2 id="share-modal-title">Share Meeting</h2>

              <button
                type="button"
                className="close-icon-btn"
                onClick={closeShareModal}
                aria-label="Close share dialog"
              >
                <FiX />
              </button>
            </div>

            {/* Room ID */}
            <label htmlFor="room-id">Room ID</label>

            <div className="share-field">
              <input
                id="room-id"
                value={roomId || ""}
                readOnly
                onFocus={(event) => event.target.select()}
              />

              <button
                type="button"
                onClick={copyMeetingId}
                aria-label="Copy room ID"
              >
                <FiCopy />
                {copied === "id" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Meeting Link */}
            <label htmlFor="meeting-link">Room Link</label>

            <div className="share-field">
              <input
                id="meeting-link"
                value={meetingLink}
                readOnly
                onFocus={(event) => event.target.select()}
              />

              <button
                type="button"
                onClick={copyMeetingLink}
                aria-label="Copy meeting link"
              >
                <FiCopy />
                {copied === "link" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              className="close-btn"
              onClick={closeShareModal}
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