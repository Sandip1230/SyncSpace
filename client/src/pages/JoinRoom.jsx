import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoom } from "../services/api";
import { getStoredUsername, setStoredUsername, randomGuestName } from "../utils/helper";
import "./Pages.css";

function JoinRoom() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState(getStoredUsername() || randomGuestName());
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleJoin = async () => {
    const id = roomId.trim();
    if (!id) return;
    setStatus("checking");
    setError("");
    try {
      await getRoom(id).catch(() => null);
      setStoredUsername(username);
      navigate(`/workspace/${id}`);
    } catch (err) {
      setError(err.message || "Could not reach the server.");
      setStatus("error");
    }
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">Join a room</h2>
      <input className="page-input" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room code" />
      <input className="page-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your display name" />
      <button className="page-btn page-btn--primary" onClick={handleJoin} disabled={status === "checking" || !roomId.trim() || !username.trim()}>
        {status === "checking" ? (<><span className="page-spinner" />Joining…</>) : "Join Room"}
      </button>
      {status === "error" && <p className="page-error">{error}</p>}
    </div>
  );
}

export default JoinRoom;