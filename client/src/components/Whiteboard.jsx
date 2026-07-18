import { Stage, Layer, Line } from "react-konva";
import { useEffect, useState } from "react";
import { addShape, clearShapes, undoLastShape, updateLastShape } from "../lib/yShapes";

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

  // Exposes clear/undo to the parent so Toolbar's buttons can drive this board.
  useEffect(() => {
    if (!registerActions || !yshapes) return;
    registerActions({
      onClear: () => clearShapes(yshapes),
      onUndo: () => undoLastShape(yshapes),
    });
  }, [registerActions, yshapes]);

  const handleMouseDown = (e) => {
    if (tool !== "pen" || !yshapes) return;
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    addShape(yshapes, { id: `${Date.now()}_${Math.random()}`, tool, color, strokeWidth, points: [pos.x, pos.y] });
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
    <Stage width={window.innerWidth * 0.6} height={window.innerHeight * 0.85} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <Layer>
        {shapes.map((s) => (
          <Line key={s.id} points={s.points} stroke={s.color} strokeWidth={s.strokeWidth} tension={0.5} lineCap="round" lineJoin="round" />
        ))}
      </Layer>
    </Stage>
  );
}

export default Whiteboard;