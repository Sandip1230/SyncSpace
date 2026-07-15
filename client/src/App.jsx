import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import Whiteboard from "./components/Whiteboard";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <>
      <Navbar />

      <div style={{ display: "flex", height: "90vh" }}>
        <Sidebar />

        <div style={{ flex: 1 }}>
          <Toolbar />
          <Whiteboard />
        </div>

        <CodeEditor />
      </div>
    </>
  );
}

export default App;