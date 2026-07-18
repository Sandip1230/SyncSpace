import { Link, useNavigate } from "react-router-dom";

function Navbar({ roomId }) {
  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div style={{ height: "60px", background: "#1f2937", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        <h2 style={{ margin: 0 }}>SyncSpace</h2>
      </Link>

      <div style={{ display: "flex", gap: "15px" }}>
        <button onClick={() => navigate("/create")}>Create Room</button>
        <button onClick={() => navigate("/join")}>Join Room</button>
        {roomId && <button onClick={handleShare}>Share</button>}
      </div>

      <div>
        <h4>User</h4>
      </div>
    </div>
  );
}

export default Navbar;