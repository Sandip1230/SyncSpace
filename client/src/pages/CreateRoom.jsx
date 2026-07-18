import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/api";
import { getStoredUsername, setStoredUsername, randomGuestName } from "../utils/helper";

function CreateRoom() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(getStoredUsername() || randomGuestName());
  const [status, setStatus] = useState("idle"); // idle | creating | error
  const [error, setError] = useState("");

  useEffect(() => {
    return () => setStatus("idle");
  }, []);

  const handleCreate = async () => {
    setStatus("creating");
    setError("");
    try {
      setStoredUsername(username);
      const { roomId } = await createRoom();
      navigate(`/workspace/${roomId}`);
    } catch (err) {
      setError(err.message || "Could not create a room. Is the server running?");
      setStatus("error");
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", color: "#e7edf7", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Create a room</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Your display name"
        style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #2c3f66", background: "#1f2937", color: "#e7edf7", width: 240 }}
      />
      <button
        onClick={handleCreate}
        disabled={status === "creating" || !username.trim()}
        style={{ padding: "10px 22px", background: "#3fc6d6", color: "#0b1526", borderRadius: 6, fontWeight: 700, border: "none", cursor: "pointer" }}
      >
        {status === "creating" ? "Creating…" : "Create Room"}
      </button>
      {status === "error" && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{error}</p>}
    </div>
  );
}

export default CreateRoom;