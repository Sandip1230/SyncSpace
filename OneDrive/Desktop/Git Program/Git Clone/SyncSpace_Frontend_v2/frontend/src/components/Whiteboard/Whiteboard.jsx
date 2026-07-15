import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Stage, Layer, Line, Rect, Ellipse, Arrow, Text, Group, Shape } from "react-konva";
import * as Y from "yjs";
import Toolbar from "./Toolbar";
import { makeId } from "../../lib/id";
import "./Whiteboard.css";

const MIN_DRAG = 3; // px — below this, a click isn't treated as a drag-drawn shape

export default function Whiteboard({ shapesMap, ydoc, onClose, defaultColor, defaultStrokeWidth }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const undoManagerRef = useRef(null);

  const [size, setSize] = useState({ width: 800, height: 600 });
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(defaultColor || "#3fc6d6");
  const [strokeWidth, setStrokeWidth] = useState(defaultStrokeWidth || 3);

  const [shapes, setShapes] = useState([]);
  const [draft, setDraft] = useState(null); // in-progress shape, not yet committed to Yjs
  const isDrawing = useRef(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState("");

  // ---- keep React state in sync with the CRDT map ----
  useEffect(() => {
    const sync = () =>
      setShapes(Array.from(shapesMap.entries()).map(([id, s]) => ({ id, ...s })));
    sync();
    shapesMap.observe(sync);
    return () => shapesMap.unobserve(sync);
  }, [shapesMap]);

  useEffect(() => {
    undoManagerRef.current = new Y.UndoManager(shapesMap);
    return () => undoManagerRef.current?.destroy();
  }, [shapesMap]);

  // ---- responsive canvas sizing ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const putShape = useCallback(
    (id, shape) => {
      ydoc.transact(() => shapesMap.set(id, shape));
    },
    [ydoc, shapesMap]
  );

  const removeShape = useCallback(
    (id) => {
      ydoc.transact(() => shapesMap.delete(id));
    },
    [ydoc, shapesMap]
  );

  const clearAll = useCallback(() => {
    ydoc.transact(() => {
      Array.from(shapesMap.keys()).forEach((k) => shapesMap.delete(k));
    });
  }, [ydoc, shapesMap]);

  // ---- pointer handlers ----
  const getPointer = () => stageRef.current.getPointerPosition();

  const handleMouseDown = () => {
    if (editingTextId) commitTextEdit();
    const pos = getPointer();
    if (!pos) return;

    if (tool === "text") {
      const id = makeId("shape");
      putShape(id, {
        type: "text",
        x: pos.x,
        y: pos.y,
        text: "Text",
        fill: color,
        fontSize: 18,
      });
      setEditingTextId(id);
      setEditingTextValue("Text");
      setTool("select");
      return;
    }

    if (tool === "select" || tool === "eraser") return;

    isDrawing.current = true;
    if (tool === "pen") {
      setDraft({ type: "pen", points: [pos.x, pos.y], stroke: color, strokeWidth });
    } else if (tool === "rect") {
      setDraft({ type: "rect", x: pos.x, y: pos.y, width: 0, height: 0, stroke: color, strokeWidth });
    } else if (tool === "ellipse") {
      setDraft({ type: "ellipse", x: pos.x, y: pos.y, radiusX: 0, radiusY: 0, stroke: color, strokeWidth });
    } else if (tool === "arrow") {
      setDraft({ type: "arrow", points: [pos.x, pos.y, pos.x, pos.y], stroke: color, strokeWidth });
    }
  };

  const handleMouseMove = () => {
    if (!isDrawing.current || !draft) return;
    const pos = getPointer();
    if (!pos) return;

    setDraft((prev) => {
      if (!prev) return prev;
      if (prev.type === "pen") {
        return { ...prev, points: [...prev.points, pos.x, pos.y] };
      }
      if (prev.type === "rect") {
        return { ...prev, width: pos.x - prev.x, height: pos.y - prev.y };
      }
      if (prev.type === "ellipse") {
        return {
          ...prev,
          radiusX: Math.abs(pos.x - prev.x),
          radiusY: Math.abs(pos.y - prev.y),
          x0: prev.x,
          y0: prev.y,
        };
      }
      if (prev.type === "arrow") {
        return { ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] };
      }
      return prev;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (!draft) return;

    const id = makeId("shape");
    if (draft.type === "pen" && draft.points.length >= 4) {
      putShape(id, draft);
    } else if (draft.type === "rect" && (Math.abs(draft.width) > MIN_DRAG || Math.abs(draft.height) > MIN_DRAG)) {
      // normalize negative width/height so hit-testing & rendering stay simple
      const x = draft.width < 0 ? draft.x + draft.width : draft.x;
      const y = draft.height < 0 ? draft.y + draft.height : draft.y;
      putShape(id, { ...draft, x, y, width: Math.abs(draft.width), height: Math.abs(draft.height) });
    } else if (draft.type === "ellipse" && (draft.radiusX > MIN_DRAG || draft.radiusY > MIN_DRAG)) {
      putShape(id, { ...draft, x: draft.x0 ?? draft.x, y: draft.y0 ?? draft.y });
    } else if (draft.type === "arrow") {
      const [x1, y1, x2, y2] = draft.points;
      if (Math.hypot(x2 - x1, y2 - y1) > MIN_DRAG) putShape(id, draft);
    }
    setDraft(null);
  };

  const handleShapeClick = (shape) => {
    if (tool === "eraser") {
      removeShape(shape.id);
    }
  };

  const handleShapeDblClick = (shape) => {
    if (shape.type === "text" && tool === "select") {
      setEditingTextId(shape.id);
      setEditingTextValue(shape.text);
    }
  };

  const handleGroupDragEnd = (shape, e) => {
    const dx = e.target.x();
    const dy = e.target.y();
    e.target.position({ x: 0, y: 0 });
    const newPoints = shape.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy));
    putShape(shape.id, { ...shape, points: newPoints });
  };

  const commitTextEdit = () => {
    if (!editingTextId) return;
    const existing = shapesMap.get(editingTextId);
    if (existing) {
      const trimmed = editingTextValue.trim();
      if (trimmed.length === 0) removeShape(editingTextId);
      else putShape(editingTextId, { ...existing, text: trimmed });
    }
    setEditingTextId(null);
    setEditingTextValue("");
  };

  const cursorForTool = useMemo(() => {
    if (tool === "eraser") return "cell";
    if (tool === "select") return "default";
    if (tool === "text") return "text";
    return "crosshair";
  }, [tool]);

  const editingShape = editingTextId ? shapesMap.get(editingTextId) : null;

  return (
    <div className="whiteboard">
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={() => undoManagerRef.current?.undo()}
        onRedo={() => undoManagerRef.current?.redo()}
        onClear={clearAll}
        onClose={onClose}
      />

      <div className="whiteboard__canvas" ref={containerRef} style={{ cursor: cursorForTool }}>
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {/* dot-grid background for spatial reference */}
            <BackgroundGrid width={size.width} height={size.height} />

            {shapes.map((shape) => (
              <ShapeNode
                key={shape.id}
                shape={shape}
                draggable={tool === "select"}
                onClick={() => handleShapeClick(shape)}
                onDblClick={() => handleShapeDblClick(shape)}
                onDragEndPoint={(e) => handleGroupDragEnd(shape, e)}
                onDragEndXY={(e) =>
                  putShape(shape.id, { ...shape, x: e.target.x(), y: e.target.y() })
                }
                dimmed={editingTextId === shape.id}
              />
            ))}

            {draft && <ShapeNode shape={{ ...draft, id: "__draft" }} draggable={false} preview />}
          </Layer>
        </Stage>

        {editingShape && (
          <textarea
            autoFocus
            className="whiteboard__text-editor"
            style={{
              left: editingShape.x,
              top: editingShape.y - 4,
              color: editingShape.fill,
              fontSize: editingShape.fontSize,
            }}
            value={editingTextValue}
            onChange={(e) => setEditingTextValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                commitTextEdit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                commitTextEdit();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function BackgroundGrid({ width, height }) {
  const gap = 28;
  return (
    <Shape
      listening={false}
      sceneFunc={(ctx, node) => {
        ctx.fillStyle = "#1c2c4a";
        for (let x = gap; x < width; x += gap) {
          for (let y = gap; y < height; y += gap) {
            ctx.beginPath();
            ctx.arc(x, y, 1.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.fillStrokeShape(node);
      }}
    />
  );
}

function ShapeNode({ shape, draggable, onClick, onDblClick, onDragEndPoint, onDragEndXY, dimmed, preview }) {
  const commonProps = {
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    opacity: preview ? 0.6 : dimmed ? 0.15 : 1,
    lineCap: "round",
    lineJoin: "round",
    onClick,
    onTap: onClick,
    onDblClick,
    onDblTap: onDblClick,
  };

  if (shape.type === "pen") {
    return (
      <Group draggable={draggable} onDragEnd={onDragEndPoint}>
        <Line points={shape.points} {...commonProps} tension={0.15} />
      </Group>
    );
  }

  if (shape.type === "arrow") {
    return (
      <Group draggable={draggable} onDragEnd={onDragEndPoint}>
        <Arrow points={shape.points} fill={shape.stroke} pointerLength={10} pointerWidth={10} {...commonProps} />
      </Group>
    );
  }

  if (shape.type === "rect") {
    return (
      <Rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        cornerRadius={4}
        draggable={draggable}
        onDragEnd={onDragEndXY}
        {...commonProps}
      />
    );
  }

  if (shape.type === "ellipse") {
    return (
      <Ellipse
        x={shape.x}
        y={shape.y}
        radiusX={shape.radiusX}
        radiusY={shape.radiusY}
        draggable={draggable}
        onDragEnd={onDragEndXY}
        {...commonProps}
      />
    );
  }

  if (shape.type === "text") {
    return (
      <Text
        x={shape.x}
        y={shape.y}
        text={shape.text}
        fontSize={shape.fontSize}
        fill={shape.fill}
        opacity={dimmed ? 0.15 : 1}
        draggable={draggable}
        onDragEnd={onDragEndXY}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
        onDblTap={onDblClick}
      />
    );
  }

  return null;
}
