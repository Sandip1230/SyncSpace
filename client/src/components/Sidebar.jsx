import {
  FaPen,
  FaEraser,
  FaSquare,
  FaCircle,
  FaFont,
  FaUndo,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

function Sidebar({ setTool, clearCanvas, undo, redo }) {
  return (
    <div
      style={{
        width: "70px",
        height: "100%",
        background: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "15px",
        paddingTop: "20px",
      }}
    >
      <button onClick={() => setTool("pen")}>
        <FaPen />
      </button>

      <button onClick={() => setTool("eraser")}>
        <FaEraser />
      </button>

      <button onClick={() => setTool("rectangle")}>
        <FaSquare />
      </button>

      <button onClick={() => setTool("circle")}>
        <FaCircle />
      </button>

      <button onClick={() => setTool("text")}>
        <FaFont />
      </button>

      <button onClick={undo}>
        <FaUndo />
      </button>

      <button onClick={redo}>
        <FaRedo />
      </button>

      <button onClick={clearCanvas}>
        <FaTrash />
      </button>
    </div>
  );
}

export default Sidebar;