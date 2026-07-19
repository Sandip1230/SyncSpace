import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import "./Pages.css";

function Home() {
  return (
    <div className="page-shell">
      <Logo size={40} />
      <h1 className="page-title">SyncSpace</h1>
      <p className="page-subtitle">Real-time collaborative code editor and whiteboard for teams.</p>
      <div className="page-actions">
        <Link to="/create" className="page-btn page-btn--primary" style={{ textDecoration: "none" }}>Create Room</Link>
        <Link to="/join" className="page-btn page-btn--secondary" style={{ textDecoration: "none" }}>Join Room</Link>
      </div>
    </div>
  );
}

export default Home;