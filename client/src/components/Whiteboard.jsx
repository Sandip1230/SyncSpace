import { Stage, Layer, Line } from "react-konva";
import { useEffect, useState } from "react";
import { addShape, clearShapes, undoLastShape, updateLastShape } from "../lib/yShapes";

const DRAWABLE_TOOLS = ["pen", "eraser"];

function Whiteboard({ yshapes, tool, color, strokeWidth, registerActions }) {
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!yshapes) return undefined;
    const sync = () => setShapes(yshapes.toArray());
    sync();
    yshapes.observe(sync);
    return () => yshapes.unobserve(sync);
  }, [yshapes]);

  useEffect(() => {
    if (!registerActions || !yshapes) return;
    registerActions({
      onClear: () => clearShapes(yshapes),
      onUndo: () => undoLastShape(yshapes),
    });
  }, [registerActions, yshapes]);

  const handleMouseDown = (e) => {
    if (!DRAWABLE_TOOLS.includes(tool) || !yshapes) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    // Eraser strokes are a fair bit fatter than the pen so a single drag
    // actually clears the width it visually covers, not just a hairline.
    const width = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
    addShape(yshapes, { id: `${Date.now()}_${Math.random()}`, tool, color, strokeWidth: width, points: [pos.x, pos.y] });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !yshapes) return;
    const point = e.target.getStage().getPointerPosition();
    const last = shapes[shapes.length - 1];
    if (!last) return;
    updateLastShape(yshapes, [...last.points, point.x, point.y]);
  };

  const handleMouseUp = () => setIsDrawing(false);

  return (
    <Stage
      width={window.innerWidth * 0.6}
      height={window.innerHeight * 0.85}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {shapes.map((s) => (
          <Line
            key={s.id}
            points={s.points}
            stroke={s.tool === "eraser" ? "#000" : s.color}
            strokeWidth={s.strokeWidth}
            tension={s.tool === "eraser" ? 0 : 0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={s.tool === "eraser" ? "destination-out" : "source-over"}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default Whiteboard;