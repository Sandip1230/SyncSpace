import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoom } from "../services/api";
import { getStoredUsername, setStoredUsername, randomGuestName } from "../utils/helper";

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
      // Informational only — a room is really created the moment the
      // first socket joins it (see sockets/roomStore.js), so a "not
      // active yet" room is still fine to join, just empty.
      await getRoom(id).catch(() => null);
      setStoredUsername(username);
      navigate(`/workspace/${id}`);
    } catch (err) {
      setError(err.message || "Could not reach the server.");
      setStatus("error");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", color: "#e7edf7", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Join a room</h2>
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room code"
        style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #2c3f66", background: "#1f2937", color: "#e7edf7", width: 240 }}
      />
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your display name"
        style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #2c3f66", background: "#1f2937", color: "#e7edf7", width: 240 }}
      />
      <button
        onClick={handleJoin}
        disabled={status === "checking" || !roomId.trim() || !username.trim()}
        style={{ padding: "10px 22px", background: "#3fc6d6", color: "#0b1526", borderRadius: 6, fontWeight: 700, border: "none", cursor: "pointer" }}
      >
        {status === "checking" ? "Joining…" : "Join Room"}
      </button>
      {status === "error" && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{error}</p>}
    </div>
  );
}

export default JoinRoom;