function Navbar() {
  return (
    <div
      style={{
        height: "60px",
        background: "#1f2937",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
      }}
    >
      <h2>SyncSpace</h2>

      <div style={{ display: "flex", gap: "15px" }}>
        <button>Create Room</button>
        <button>Join Room</button>
        <button>Share</button>
      </div>

      <div>
        <h4>User</h4>
      </div>
    </div>
  );
}

export default Navbar;