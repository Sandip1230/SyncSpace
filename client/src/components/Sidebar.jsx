function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

function Sidebar({ roomId, users = [], connected }) {
  const copyRoomId = () => navigator.clipboard?.writeText(roomId);

  return (
    <div style={{ width: 200, minWidth: 200, height: "100%", background: "#1f2937", color: "#e7edf7", padding: 16, boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.6, marginBottom: 6 }}>Room</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <code style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis" }}>{roomId}</code>
        <button onClick={copyRoomId} title="Copy room ID" style={{ fontSize: 11, background: "#2c3f66", border: "none", color: "#e7edf7", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>
          Copy
        </button>
      </div>
      <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#3ddc97" : "#ff6b6b", display: "inline-block" }} />
        {connected ? "Live" : "Offline"}
      </div>

      <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.6, marginBottom: 8 }}>
        Online ({users.length})
      </div>
      {users.length === 0 && <div style={{ fontSize: 12, opacity: 0.5 }}>Just you, for now.</div>}
      {users.map((u) => (
        <div key={u.socketId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: stringToColor(u.socketId), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            {(u.username || "?").slice(0, 1).toUpperCase()}
          </span>
          <span style={{ fontSize: 13 }}>{u.username}</span>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;