import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import "./ChatPanel.css";

function stringToColor(str = "") {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitial(username) {
  return (username || "?").trim().slice(0, 1).toUpperCase();
}

function ChatPanel({ ychat, username, roomId }) {
  const { messages, send } = useChat(ychat, username);

  const {
    typingUsers,
    notifyTyping,
    notifyStoppedTyping,
  } = useTypingIndicator(roomId, username);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);

  const bodyRef = useRef(null);
  const lastSeenCount = useRef(messages.length);
  const wasTyping = useRef(false);

  /*
   * Cache avatar colors so they don't get recalculated
   * every time the component renders.
   */
  const avatarColors = useMemo(() => {
    const colors = {};

    messages.forEach((message) => {
      if (message.username && !colors[message.username]) {
        colors[message.username] = stringToColor(message.username);
      }
    });

    typingUsers.forEach((user) => {
      if (user.username && !colors[user.username]) {
        colors[user.username] = stringToColor(user.username);
      }
    });

    if (username && !colors[username]) {
      colors[username] = stringToColor(username);
    }

    return colors;
  }, [messages, typingUsers, username]);

  /*
   * Detect new messages and maintain unread count.
   */
  useEffect(() => {
    if (open) {
      setUnread(0);
      lastSeenCount.current = messages.length;
      return;
    }

    if (messages.length > lastSeenCount.current) {
      setUnread(messages.length - lastSeenCount.current);
    }
  }, [messages.length, open]);

  /*
   * Scroll to bottom when:
   * - Chat opens
   * - New messages arrive
   * - Typing indicator changes
   *
   * Only auto-scroll if the user is already near the bottom.
   */
  useEffect(() => {
    const container = bodyRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom = distanceFromBottom < 120;

    if (open && isNearBottom) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages, typingUsers.length, open]);

  /*
   * Stop typing when component unmounts.
   */
  useEffect(() => {
    return () => {
      if (wasTyping.current) {
        notifyStoppedTyping();
        wasTyping.current = false;
      }
    };
  }, [notifyStoppedTyping]);

  const stopTyping = useCallback(() => {
    if (wasTyping.current) {
      notifyStoppedTyping();
      wasTyping.current = false;
    }
  }, [notifyStoppedTyping]);

  const handleSend = useCallback(
    (event) => {
      event.preventDefault();

      const text = draft.trim();

      if (!text) return;

      send(text);

      setDraft("");
      stopTyping();

      /*
       * Immediately scroll after sending.
       */
      requestAnimationFrame(() => {
        const container = bodyRef.current;

        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    [draft, send, stopTyping]
  );

  const handleChange = useCallback(
    (event) => {
      const value = event.target.value;

      setDraft(value);

      if (value.trim()) {
        if (!wasTyping.current) {
          notifyTyping();
          wasTyping.current = true;
        }
      } else {
        stopTyping();
      }
    },
    [notifyTyping, stopTyping]
  );

  const handleKeyDown = useCallback(
    (event) => {
      /*
       * Enter sends the message.
       * Shift + Enter can still create a new line.
       */
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (draft.trim()) {
          handleSend(event);
        }
      }
    },
    [draft, handleSend]
  );

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const handleClose = () => {
    setOpen(false);
    stopTyping();
  };

  return (
    <>
      {/* Chat toggle */}
      <button
        type="button"
        className="chat-toggle"
        onClick={handleToggle}
        title={open ? "Close room chat" : "Open room chat"}
        aria-label={open ? "Close room chat" : "Open room chat"}
        aria-expanded={open}
        aria-controls="room-chat-panel"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H9l-5 4V6a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>

        {unread > 0 && (
          <span
            className="chat-toggle__badge"
            aria-label={`${unread} unread messages`}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <section
          id="room-chat-panel"
          className="chat-panel"
          aria-label="Room chat"
        >
          {/* Header */}
          <header className="chat-panel__header">
            <div className="chat-panel__title">
              <span>Room Chat</span>

              {messages.length > 0 && (
                <span className="chat-panel__count">
                  {messages.length}
                </span>
              )}
            </div>

            <button
              type="button"
              className="chat-panel__close"
              onClick={handleClose}
              aria-label="Close chat"
              title="Close chat"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div
            className="chat-panel__body"
            ref={bodyRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 && typingUsers.length === 0 && (
              <div className="chat-panel__empty">
                <div className="chat-panel__empty-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H9l-5 4V6a1 1 0 011-1z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <strong>No messages yet</strong>
                <span>Start a conversation with your team.</span>
              </div>
            )}

            {messages.map((message) => {
              const isOwn = message.username === username;
              const color =
                avatarColors[message.username] ||
                stringToColor(message.username);

              return (
                <div
                  key={message.id}
                  className={`chat-msg ${isOwn ? "is-own" : ""}`}
                >
                  <span
                    className="chat-msg__avatar"
                    style={{ background: color }}
                    aria-hidden="true"
                  >
                    {getInitial(message.username)}
                  </span>

                  <div className="chat-msg__bubble">
                    <div className="chat-msg__meta">
                      <span className="chat-msg__name">
                        {isOwn ? "You" : message.username || "Unknown"}
                      </span>

                      <time
                        className="chat-msg__time"
                        dateTime={message.createdAt}
                      >
                        {formatTime(message.createdAt)}
                      </time>
                    </div>

                    <div className="chat-msg__text">
                      {message.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicators */}
            {typingUsers.map((user) => {
              const color =
                avatarColors[user.username] ||
                stringToColor(user.username);

              return (
                <div
                  key={user.socketId}
                  className="chat-msg chat-msg--typing"
                >
                  <span
                    className="chat-msg__avatar"
                    style={{ background: color }}
                    aria-hidden="true"
                  >
                    {getInitial(user.username)}
                  </span>

                  <div
                    className="typing-dots"
                    aria-label={`${user.username} is typing`}
                  >
                    <span className="typing-dots__dot" />
                    <span className="typing-dots__dot" />
                    <span className="typing-dots__dot" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form
            className="chat-panel__input"
            onSubmit={handleSend}
          >
            <div className="chat-panel__input-wrapper">
              <input
                value={draft}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Message the room…"
                maxLength={500}
                aria-label="Type a message"
                autoComplete="off"
              />

              {draft.length > 400 && (
                <span
                  className={`chat-panel__counter ${
                    draft.length >= 480
                      ? "is-warning"
                      : ""
                  }`}
                >
                  {draft.length}/500
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12l16-8-6 8 6 8-16-8z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default ChatPanel;