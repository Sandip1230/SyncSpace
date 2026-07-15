import "./Header.css";

const MODES = [
  { key: "code", label: "Code", icon: "code" },
  { key: "split", label: "Split", icon: "split" },
  { key: "annotate", label: "Annotate", icon: "annotate" },
];

function ModeIcon({ name }) {
  const props = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true };
  if (name === "annotate") {
    return (
      <svg {...props}>
        <path
          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (name === "split") {
    return (
      <svg {...props}>
        <rect x="3.5" y="4.5" width="7.5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="4.5" width="7.5" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (name === "code") {
    return (
      <svg {...props}>
        <path
          d="M9.4 16.6L4.8 12l4.6-4.6M14.6 7.4l4.6 4.6-4.6 4.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export default function Header({ mode, onModeChange, roomId, connected, peerCount, onOpenSettings }) {
  const activeIndex = Math.max(
    0,
    MODES.findIndex((m) => m.key === mode)
  );

  return (
    <header className="app-header">
      <div className="app-header__section app-header__brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M8 4 3 12l5 8M16 4l5 8-5 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="brand-name">SyncSpace</span>
      </div>

      <div className="app-header__section app-header__center">
        <div
          className="mode-toggle"
          role="tablist"
          aria-label="Workspace mode"
          style={{
            "--mode-count": MODES.length,
            "--mode-index": activeIndex,
          }}
        >
          <span className="mode-toggle__indicator" aria-hidden="true" />
          {MODES.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={mode === m.key}
              className={`mode-toggle__btn ${mode === m.key ? "is-active" : ""}`}
              onClick={() => onModeChange(m.key)}
            >
              <ModeIcon name={m.icon} />
              <span className="mode-toggle__label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="app-header__section app-header__meta">
        <span className="room-chip" title="Shareable room id">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07l-1.5 1.5M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07l1.5-1.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {roomId}
        </span>

        <span className="peer-count" title={`${peerCount} other participant(s)`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M3 20c0-3.31 2.69-6 6-6s6 2.69 6 6M16 8a3 3 0 110 6M21 20c0-2.5-1.5-4.5-3.5-5.3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {peerCount}
        </span>

        <span className={`status-pill ${connected ? "is-live" : "is-offline"}`}>
          <span className="status-pill__dot" />
          {connected ? "Live" : "Offline"}
        </span>

        <button className="settings-trigger" onClick={onOpenSettings} title="Settings" aria-label="Open settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M19.4 13a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V19a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H4a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H10a1.7 1.7 0 001-1.55V4a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V10a1.7 1.7 0 001.55 1H20a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
