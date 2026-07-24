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
  // ...unchanged JSX above...

  return (
    <aside className="wb-toolbar">
      {/* ...unchanged tool/color/width groups... */}

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
        {/* ...rest unchanged... */}
      </div>
    </aside>
  );
}