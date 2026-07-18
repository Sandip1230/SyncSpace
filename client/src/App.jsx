import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Workspace from "./pages/Workspace";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/workspace/:roomId" element={<Workspace />} />
    </Routes>
  );
}

export default App;