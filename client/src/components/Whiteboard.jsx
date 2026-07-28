// import { Stage, Layer, Line, Rect, Ellipse, Arrow, Text } from "react-konva";
// import { useEffect, useRef, useState } from "react";
// import { addShape, updateLastShape, updateShapeById } from "../lib/yShapes";

// const FREEHAND_TOOLS = ["pen", "eraser"];
// const BOX_TOOLS = ["rect", "ellipse"];

// function genId() {
//   return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
// }

// function Whiteboard({ yshapes, tool, color, strokeWidth }) {
//   const containerRef = useRef(null);
//   const [size, setSize] = useState({ width: 800, height: 600 });
//   const [shapes, setShapes] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [startPoint, setStartPoint] = useState(null);
//   const [selectedId, setSelectedId] = useState(null);
//   const [editingText, setEditingText] = useState(null); // { x, y, value }

//   useEffect(() => {
//     const el = containerRef.current;
//     if (!el) return undefined;
//     const ro = new ResizeObserver((entries) => {
//       const { width, height } = entries[0].contentRect;
//       setSize({ width, height });
//     });
//     ro.observe(el);
//     return () => ro.disconnect();
//   }, []);

//   useEffect(() => {
//     if (!yshapes) return undefined;
//     const sync = () => setShapes(yshapes.toArray());
//     sync();
//     yshapes.observe(sync);
//     return () => yshapes.unobserve(sync);
//   }, [yshapes]);

//   useEffect(() => {
//     setSelectedId(null);
//   }, [tool]);

//   const commitTextEdit = () => {
//     if (editingText && editingText.value.trim() && yshapes) {
//       addShape(yshapes, {
//         id: genId(),
//         tool: "text",
//         x: editingText.x,
//         y: editingText.y,
//         text: editingText.value,
//         color,
//         fontSize: 18,
//         offsetX: 0,
//         offsetY: 0,
//       });
//     }
//     setEditingText(null);
//   };

//   const handleMouseDown = (e) => {
//     if (!yshapes) return;
//     const isEmptyStage = e.target === e.target.getStage();
//     const pos = e.target.getStage().getPointerPosition();

//     if (tool === "select") {
//       if (isEmptyStage) setSelectedId(null);
//       return;
//     }
//     if (tool === "text") {
//       if (!isEmptyStage) return;
//       if (editingText) commitTextEdit();
//       setEditingText({ x: pos.x, y: pos.y, value: "" });
//       return;
//     }

//     if (FREEHAND_TOOLS.includes(tool)) {
//       setIsDrawing(true);
//       const width = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
//       addShape(yshapes, { id: genId(), tool, color, strokeWidth: width, points: [pos.x, pos.y], offsetX: 0, offsetY: 0 });
//     } else if (BOX_TOOLS.includes(tool)) {
//       setIsDrawing(true);
//       setStartPoint(pos);
//       addShape(yshapes, { id: genId(), tool, color, strokeWidth, x: pos.x, y: pos.y, width: 0, height: 0 });
//     } else if (tool === "arrow") {
//       setIsDrawing(true);
//       setStartPoint(pos);
//       addShape(yshapes, { id: genId(), tool, color, strokeWidth, points: [pos.x, pos.y, pos.x, pos.y], offsetX: 0, offsetY: 0 });
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing || !yshapes) return;
//     const pos = e.target.getStage().getPointerPosition();
//     const last = shapes[shapes.length - 1];
//     if (!last) return;

//     if (FREEHAND_TOOLS.includes(last.tool)) {
//       updateLastShape(yshapes, { points: [...last.points, pos.x, pos.y] });
//     } else if (BOX_TOOLS.includes(last.tool) && startPoint) {
//       updateLastShape(yshapes, {
//         x: Math.min(startPoint.x, pos.x),
//         y: Math.min(startPoint.y, pos.y),
//         width: Math.abs(pos.x - startPoint.x),
//         height: Math.abs(pos.y - startPoint.y),
//       });
//     } else if (last.tool === "arrow" && startPoint) {
//       updateLastShape(yshapes, { points: [startPoint.x, startPoint.y, pos.x, pos.y] });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     setStartPoint(null);
//   };

//   const selectableProps = (s) =>
//     tool === "select"
//       ? {
//           draggable: true,
//           onClick: () => setSelectedId(s.id),
//           onTap: () => setSelectedId(s.id),
//           onDragEnd: (e) => {
//             if (s.tool === "rect" || s.tool === "text") {
//               updateShapeById(yshapes, s.id, { x: e.target.x(), y: e.target.y() });
//             } else if (s.tool === "ellipse") {
//               updateShapeById(yshapes, s.id, {
//                 x: e.target.x() - s.width / 2,
//                 y: e.target.y() - s.height / 2,
//               });
//             } else {
//               updateShapeById(yshapes, s.id, { offsetX: e.target.x(), offsetY: e.target.y() });
//             }
//           },
//         }
//       : {};

//   return (
//     <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
//       <Stage width={size.width} height={size.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
//         <Layer>
//           {shapes.map((s) => {
//             const stroke = s.id === selectedId ? "#3fc6d6" : s.color;

//             if (s.tool === "rect") {
//               return <Rect key={s.id} x={s.x} y={s.y} width={s.width} height={s.height} stroke={stroke} strokeWidth={s.strokeWidth} dash={s.id === selectedId ? [4, 4] : undefined} {...selectableProps(s)} />;
//             }
//             if (s.tool === "ellipse") {
//               return (
//                 <Ellipse
//                   key={s.id}
//                   x={s.x + s.width / 2}
//                   y={s.y + s.height / 2}
//                   radiusX={s.width / 2}
//                   radiusY={s.height / 2}
//                   stroke={stroke}
//                   strokeWidth={s.strokeWidth}
//                   dash={s.id === selectedId ? [4, 4] : undefined}
//                   {...selectableProps(s)}
//                 />
//               );
//             }
//             if (s.tool === "arrow") {
//               return (
//                 <Arrow key={s.id} x={s.offsetX || 0} y={s.offsetY || 0} points={s.points} stroke={stroke} fill={stroke} strokeWidth={s.strokeWidth} {...selectableProps(s)} />
//               );
//             }
//             if (s.tool === "text") {
//               return (
//                 <Text key={s.id} x={s.x} y={s.y} text={s.text} fontSize={s.fontSize} fill={stroke} {...selectableProps(s)} />
//               );
//             }
//             return (
//               <Line
//                 key={s.id}
//                 x={s.offsetX || 0}
//                 y={s.offsetY || 0}
//                 points={s.points}
//                 stroke={s.tool === "eraser" ? "#000" : stroke}
//                 strokeWidth={s.strokeWidth}
//                 tension={s.tool === "eraser" ? 0 : 0.5}
//                 lineCap="round"
//                 lineJoin="round"
//                 globalCompositeOperation={s.tool === "eraser" ? "destination-out" : "source-over"}
//                 {...selectableProps(s)}
//               />
//             );
//           })}
//         </Layer>
//       </Stage>

//       {editingText && (
//         <textarea
//           autoFocus
//           value={editingText.value}
//           onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
//           onBlur={commitTextEdit}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               commitTextEdit();
//             } else if (e.key === "Escape") {
//               setEditingText(null);
//             }
//           }}
//           style={{
//             position: "absolute",
//             left: editingText.x,
//             top: editingText.y,
//             fontSize: 18,
//             color,
//             background: "transparent",
//             border: "1px dashed #3fc6d6",
//             outline: "none",
//             resize: "none",
//             minWidth: 120,
//             minHeight: 28,
//           }}
//         />
//       )}
//     </div>
//   );
// }

// export default Whiteboard;

import { Stage, Layer, Line, Rect, Ellipse, Arrow, Text } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { addShape, updateLastShape, updateShapeById } from "../lib/yShapes";

const FREEHAND_TOOLS = ["pen", "eraser"];
const BOX_TOOLS = ["rect", "ellipse"];

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function Whiteboard({ yshapes, tool, color, strokeWidth }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingText, setEditingText] = useState(null); // { x, y, value }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!yshapes) return undefined;
    const sync = () => setShapes(yshapes.toArray());
    sync();
    yshapes.observe(sync);
    return () => yshapes.unobserve(sync);
  }, [yshapes]);

  const [prevTool, setPrevTool] = useState(tool);
  if (tool !== prevTool) {
    setPrevTool(tool);
    setSelectedId(null);
  }
const STORAGE_KEY = "syncspace:whiteboard-state";

const saveBoardSnapshot = (download = false) => {
  if (typeof window === "undefined") return;

  const payload = {
    shapes,
    savedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(payload);

  window.localStorage.setItem(STORAGE_KEY, serialized);

  if (!download) return;

  const blob = new Blob([serialized], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `whiteboard-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const handleClearBoard = () => {
  setShapes([]);
  setSelectedId(null);
  setEditingText(null);
  setIsDrawing(false);
  setStartPoint(null);

  if (yshapes) {
    yshapes.delete(0, yshapes.length);
  }
};

useEffect(() => {
  saveBoardSnapshot();
}, [shapes]);

  const commitTextEdit = () => {
    if (editingText && editingText.value.trim() && yshapes) {
      addShape(yshapes, {
        id: genId(),
        tool: "text",
        x: editingText.x,
        y: editingText.y,
        text: editingText.value,
        color,
        fontSize: 18,
        offsetX: 0,
        offsetY: 0,
      });
    }
    setEditingText(null);
  };

  const handleMouseDown = (e) => {
    if (!yshapes) return;
    const isEmptyStage = e.target === e.target.getStage();
    const pos = e.target.getStage().getPointerPosition();

    if (tool === "select") {
      if (isEmptyStage) setSelectedId(null);
      return;
    }
    if (tool === "text") {
      if (!isEmptyStage) return;
      if (editingText) commitTextEdit();
      setEditingText({ x: pos.x, y: pos.y, value: "" });
      return;
    }

    if (FREEHAND_TOOLS.includes(tool)) {
      setIsDrawing(true);
      const width = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
      addShape(yshapes, { id: genId(), tool, color, strokeWidth: width, points: [pos.x, pos.y], offsetX: 0, offsetY: 0 });
    } else if (BOX_TOOLS.includes(tool)) {
      setIsDrawing(true);
      setStartPoint(pos);
      addShape(yshapes, { id: genId(), tool, color, strokeWidth, x: pos.x, y: pos.y, width: 0, height: 0 });
    } else if (tool === "arrow") {
      setIsDrawing(true);
      setStartPoint(pos);
      addShape(yshapes, { id: genId(), tool, color, strokeWidth, points: [pos.x, pos.y, pos.x, pos.y], offsetX: 0, offsetY: 0 });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !yshapes) return;
    const pos = e.target.getStage().getPointerPosition();
    const last = shapes[shapes.length - 1];
    if (!last) return;

    if (FREEHAND_TOOLS.includes(last.tool)) {
      updateLastShape(yshapes, { points: [...last.points, pos.x, pos.y] });
    } else if (BOX_TOOLS.includes(last.tool) && startPoint) {
      updateLastShape(yshapes, {
        x: Math.min(startPoint.x, pos.x),
        y: Math.min(startPoint.y, pos.y),
        width: Math.abs(pos.x - startPoint.x),
        height: Math.abs(pos.y - startPoint.y),
      });
    } else if (last.tool === "arrow" && startPoint) {
      updateLastShape(yshapes, { points: [startPoint.x, startPoint.y, pos.x, pos.y] });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPoint(null);
  };

  const selectableProps = (s) =>
    tool === "select"
      ? {
          draggable: true,
          onClick: () => setSelectedId(s.id),
          onTap: () => setSelectedId(s.id),
          onDragEnd: (e) => {
            if (s.tool === "rect" || s.tool === "text") {
              updateShapeById(yshapes, s.id, { x: e.target.x(), y: e.target.y() });
            } else if (s.tool === "ellipse") {
              updateShapeById(yshapes, s.id, {
                x: e.target.x() - s.width / 2,
                y: e.target.y() - s.height / 2,
              });
            } else {
              updateShapeById(yshapes, s.id, { offsetX: e.target.x(), offsetY: e.target.y() });
            }
          },
        }
      : {};

return (
  <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 3,
        display: "flex",
        gap: 8,
      }}
    >
      <button
        type="button"
        onClick={() => saveBoardSnapshot(true)}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #3fc6d6",
          background: "#ffffff",
          cursor: "pointer",
        }}
      >
        Save
      </button>

      <button
        type="button"
        onClick={handleClearBoard}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #f87171",
          background: "#ffffff",
          cursor: "pointer",
        }}
      >
        Clear Board
      </button>
    </div>

      <Stage width={size.width} height={size.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <Layer>
          {shapes.map((s) => {
            const stroke = s.id === selectedId ? "#3fc6d6" : s.color;

            if (s.tool === "rect") {
              return <Rect key={s.id} x={s.x} y={s.y} width={s.width} height={s.height} stroke={stroke} strokeWidth={s.strokeWidth} dash={s.id === selectedId ? [4, 4] : undefined} {...selectableProps(s)} />;
            }
            if (s.tool === "ellipse") {
              return (
                <Ellipse
                  key={s.id}
                  x={s.x + s.width / 2}
                  y={s.y + s.height / 2}
                  radiusX={s.width / 2}
                  radiusY={s.height / 2}
                  stroke={stroke}
                  strokeWidth={s.strokeWidth}
                  dash={s.id === selectedId ? [4, 4] : undefined}
                  {...selectableProps(s)}
                />
              );
            }
            if (s.tool === "arrow") {
              return (
                <Arrow key={s.id} x={s.offsetX || 0} y={s.offsetY || 0} points={s.points} stroke={stroke} fill={stroke} strokeWidth={s.strokeWidth} {...selectableProps(s)} />
              );
            }
            if (s.tool === "text") {
              return (
                <Text key={s.id} x={s.x} y={s.y} text={s.text} fontSize={s.fontSize} fill={stroke} {...selectableProps(s)} />
              );
            }
            return (
              <Line
                key={s.id}
                x={s.offsetX || 0}
                y={s.offsetY || 0}
                points={s.points}
                stroke={s.tool === "eraser" ? "#000" : stroke}
                strokeWidth={s.strokeWidth}
                tension={s.tool === "eraser" ? 0 : 0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={s.tool === "eraser" ? "destination-out" : "source-over"}
                {...selectableProps(s)}
              />
            );
          })}
        </Layer>
      </Stage>

      {editingText && (
        <textarea
          autoFocus
          value={editingText.value}
          onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
          onBlur={commitTextEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitTextEdit();
            } else if (e.key === "Escape") {
              setEditingText(null);
            }
          }}
          style={{
            position: "absolute",
            left: editingText.x,
            top: editingText.y,
            fontSize: 18,
            color,
            background: "transparent",
            border: "1px dashed #3fc6d6",
            outline: "none",
            resize: "none",
            minWidth: 120,
            minHeight: 28,
          }}
        />
      )}
    </div>
  );
}

export default Whiteboard;