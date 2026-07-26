import "./Toolbar.css";

const TOOLS = [
  { id: "select", label: "Select / Move", icon: "cursor" },
  { id: "pen", label: "Pen", icon: "pen" },
  { id: "rect", label: "Rectangle", icon: "rect" },
  { id: "ellipse", label: "Ellipse", icon: "ellipse" },
  { id: "arrow", label: "Arrow", icon: "arrow" },
  { id: "text", label: "Text", icon: "text" },
  { id: "eraser", label: "Eraser", icon: "eraser" },
];

const COLORS = ["#e7edf7", "#3fc6d6", "#3ddc97", "#f2b134", "#ff6b6b", "#c77dff"];
const WIDTHS = [2, 4, 8];

function Icon({ name }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" };
  switch (name) {
    case "cursor":
      return (
        <svg {...props}>
          <path d="M5 3l14 7-6 2-2 6-6-15z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "pen":
      return (
        <svg {...props}>
          <path
            d="M12 20h9M3 20l1-4L16.5 3.5a2.1 2.1 0 013 3L7 18l-4 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "rect":
      return (
        <svg {...props}>
          <rect x="4" y="6" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="12" rx="8" ry="6" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 19L19 5M19 5H10M19 5v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "text":
      return (
        <svg {...props}>
          <path d="M5 6h14M12 6v13M9 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "eraser":
      return (
        <svg {...props}>
          <path
            d="M18 13l-7 7H7l-4-4a2 2 0 010-2.8l9-9a2 2 0 012.8 0l3.2 3.2a2 2 0 010 2.8L13 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "undo":
      return (
        <svg {...props}>
          <path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "redo":
      return (
        <svg {...props}>
          <path d="M15 7l5 5-5 5M20 12H9a5 5 0 000 10h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path
            d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  onClear,
  onClose,
}) {
  return (
    <aside className="wb-toolbar">
      <div className="wb-toolbar__group">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            className={`wb-tool ${tool === t.id ? "is-active" : ""}`}
            title={t.label}
            aria-label={t.label}
            aria-pressed={tool === t.id}
            onClick={() => onToolChange(t.id)}
          >
            <Icon name={t.icon} />
          </button>
        ))}
      </div>

      <div className="wb-toolbar__divider" />

      <div className="wb-toolbar__group wb-toolbar__colors">
        {COLORS.map((c) => (
          <button
            key={c}
            className={`wb-swatch ${color === c ? "is-active" : ""}`}
            style={{ background: c }}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            onClick={() => onColorChange(c)}
          />
        ))}
        <div className="wb-custom-color">
          <label className="wb-custom-color__swatch" style={{ background: color }} title="Pick custom color">
            <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} aria-label="Custom color picker" />
          </label>
          <input
            className="wb-custom-color__hex"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            spellCheck={false}
            maxLength={7}
            aria-label="Custom color hex value"
          />
        </div>
      </div>

      <div className="wb-toolbar__divider" />

      <div className="wb-toolbar__group wb-toolbar__widths">
        {WIDTHS.map((w) => (
          <button
            key={w}
            className={`wb-width ${strokeWidth === w ? "is-active" : ""}`}
            title={`Stroke ${w}px`}
            aria-label={`Stroke width ${w}px`}
            aria-pressed={strokeWidth === w}
            onClick={() => onStrokeWidthChange(w)}
          >
            <span style={{ width: w + 2, height: w + 2 }} />
          </button>
        ))}
      </div>

      <div className="wb-toolbar__divider" />

      <div className="wb-toolbar__group">
        <button className="wb-tool" title="Undo" aria-label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Icon name="undo" />
        </button>
        <button className="wb-tool" title="Redo" aria-label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Icon name="redo" />
        </button>
        <button
          className="wb-tool wb-tool--danger"
          title="Clear board"
          aria-label="Clear board"
          onClick={() => {
            if (window.confirm("Clear the entire whiteboard? This can't be undone.")) {
              onClear();
            }
          }}
        >
          <Icon name="trash" />
        </button>
      </div>

      <div className="wb-toolbar__spacer" />

      <button className="wb-tool wb-tool--close" title="Back to code (Esc)" aria-label="Close whiteboard" onClick={onClose}>
        <Icon name="close" />
      </button>
    </aside>
  );
}