import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoom } from "../services/api";
import {
  getStoredUsername,
  setStoredUsername,
  randomGuestName,
} from "../utils/helper";
import "./Pages.css";

function JoinRoom() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState(
    getStoredUsername() || randomGuestName()
  );
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const id = roomId.trim();

    if (!id || !username.trim()) return;

    setStatus("checking");
    setError("");

    try {
      await getRoom(id).catch(() => null);

      setStoredUsername(username.trim());

      navigate(`/workspace/${id}`);
    } catch (err) {
      setError(err.message || "Could not reach the server.");
      setStatus("error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleJoin();
    }
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">Join a room</h2>

      <input
        className="page-input"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Room code"
      />

      <input
        className="page-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Your display name"
      />

      <button
        className="page-btn page-btn--primary"
        onClick={handleJoin}
        disabled={
          status === "checking" ||
          !roomId.trim() ||
          !username.trim()
        }
      >
        {status === "checking" ? (
          <>
            <span className="page-spinner" />
            Joining…
          </>
        ) : (
          "Join Room"
        )}
      </button>

      {status === "error" && (
        <p className="page-error">{error}</p>
      )}
    </div>
  );
}

export default JoinRoom;