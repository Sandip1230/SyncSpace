import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", color: "#e7edf7", gap: 20 }}>
      <h1 style={{ margin: 0 }}>SyncSpace</h1>
      <p style={{ color: "#a9b8d4", maxWidth: 380, textAlign: "center" }}>
        Real-time collaborative code editor and whiteboard for teams.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/create" style={{ padding: "10px 20px", background: "#3fc6d6", color: "#0b1526", borderRadius: 6, fontWeight: 700, textDecoration: "none" }}>
          Create Room
        </Link>
        <Link to="/join" style={{ padding: "10px 20px", background: "#1f2937", color: "#e7edf7", borderRadius: 6, fontWeight: 700, textDecoration: "none", border: "1px solid #2c3f66" }}>
          Join Room
        </Link>
      </div>
    </div>
  );
}

export default Home;