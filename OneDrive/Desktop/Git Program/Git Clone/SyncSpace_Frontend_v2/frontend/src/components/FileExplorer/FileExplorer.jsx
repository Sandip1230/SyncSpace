import { useCallback, useRef, useState } from "react";
import { exportFile, exportProject, importFileList, importZip } from "../../lib/fileTransfer";
import "./FileExplorer.css";

function extIcon(name) {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  const map = {
    js: { c: "#f2b134", t: "JS" },
    jsx: { c: "#f2b134", t: "JSX" },
    ts: { c: "#3fc6d6", t: "TS" },
    tsx: { c: "#3fc6d6", t: "TSX" },
    py: { c: "#3ddc97", t: "PY" },
    json: { c: "#c77dff", t: "{}" },
    md: { c: "#a9b8d4", t: "MD" },
    css: { c: "#ff6b6b", t: "#" },
    html: { c: "#f2b134", t: "<>" },
  };
  return map[ext] || { c: "#6f80a3", t: "" };
}

function Chevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`fx-chevron ${open ? "is-open" : ""}`}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M3 8V6a1 1 0 011-1h4.5l1.5 1.8H20a1 1 0 011 1V8H3zM3 8h18l-1.6 10.2a1 1 0 01-1 .8H5.6a1 1 0 01-1-.8L3 8z" fill="#5cd6e4" />
      ) : (
        <path d="M3 6a1 1 0 011-1h4.7l1.6 1.8H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" fill="#3fc6d6" />
      )}
    </svg>
  );
}

function FileIcon({ name }) {
  const { c, t } = extIcon(name);
  return (
    <span className="fx-file-icon" style={{ color: c }} aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 2h8l5 5v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      {t && <span className="fx-file-icon__badge">{t}</span>}
    </span>
  );
}

function TreeNode({ node, depth, activeFileId, expanded, onToggle, onOpen, onContextMenu, dragState, setDragState, onDrop }) {
  const isFolder = node.type === "folder";
  const isOpen = expanded.has(node.id);

  return (
    <div>
      <div
        className={`fx-row ${node.type === "file" && node.id === activeFileId ? "is-active" : ""} ${
          dragState.overId === node.id && isFolder ? "is-drop-target" : ""
        }`}
        style={{ paddingLeft: 10 + depth * 14 }}
        draggable
        onDragStart={() => setDragState({ draggingId: node.id, overId: null })}
        onDragOver={(e) => {
          if (!isFolder) return;
          e.preventDefault();
          setDragState((s) => ({ ...s, overId: node.id }));
        }}
        onDragLeave={() => setDragState((s) => (s.overId === node.id ? { ...s, overId: null } : s))}
        onDrop={(e) => {
          e.preventDefault();
          if (isFolder && dragState.draggingId) onDrop(dragState.draggingId, node.id);
          setDragState({ draggingId: null, overId: null });
        }}
        onClick={() => (isFolder ? onToggle(node.id) : onOpen(node.id))}
        onContextMenu={(e) => onContextMenu(e, node)}
        title={node.name}
      >
        {isFolder ? <Chevron open={isOpen} /> : <span className="fx-chevron-spacer" />}
        {isFolder ? <FolderIcon open={isOpen} /> : <FileIcon name={node.name} />}
        <span className="fx-name">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              expanded={expanded}
              onToggle={onToggle}
              onOpen={onOpen}
              onContextMenu={onContextMenu}
              dragState={dragState}
              setDragState={setDragState}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ fileSystem, fileTreeMap, ydoc, onCollapse }) {
  const { tree, entries, activeFileId, openFile, createFile, createFolder, rename, remove, move } = fileSystem;
  const [expanded, setExpanded] = useState(() => new Set());
  const [menu, setMenu] = useState(null); // { x, y, node }
  const [dragState, setDragState] = useState({ draggingId: null, overId: null });
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleContextMenu = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleNewFile = () => {
    const name = window.prompt("New file name", "untitled.js");
    if (name) createFile(menu?.node?.type === "folder" ? menu.node.id : null, name);
    closeMenu();
  };

  const handleNewFolder = () => {
    const name = window.prompt("New folder name", "new-folder");
    if (name) createFolder(menu?.node?.type === "folder" ? menu.node.id : null, name);
    closeMenu();
  };

  const handleRename = () => {
    if (!menu?.node) return;
    const name = window.prompt("Rename", menu.node.name);
    if (name) rename(menu.node.id, name);
    closeMenu();
  };

  const handleDelete = () => {
    if (!menu?.node) return;
    const label = menu.node.type === "folder" ? "this folder and everything in it" : `"${menu.node.name}"`;
    if (window.confirm(`Delete ${label}? This can't be undone.`)) remove(menu.node.id);
    closeMenu();
  };

  const handleExportOne = () => {
    if (menu?.node?.type === "file") exportFile(ydoc, entries, menu.node.id);
    closeMenu();
  };

  return (
    <aside className="file-explorer" onClick={closeMenu}>
      <div className="fx-toolbar">
        <span className="fx-toolbar__title">Explorer</span>
        <div className="fx-toolbar__actions">
          <button className="fx-icon-btn" title="New file" aria-label="New file" onClick={() => { const n = window.prompt("New file name", "untitled.js"); if (n) createFile(null, n); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 2h8l5 5v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" /><path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <button className="fx-icon-btn" title="New folder" aria-label="New folder" onClick={() => { const n = window.prompt("New folder name", "new-folder"); if (n) createFolder(null, n); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h4.7l1.6 1.8H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" stroke="currentColor" strokeWidth="1.5" /><path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
          <button className="fx-icon-btn" title="Import files" aria-label="Import files" onClick={() => fileInputRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M7 10l5 5 5-5M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="fx-icon-btn" title="Open folder" aria-label="Open folder" onClick={() => folderInputRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6a1 1 0 011-1h4.7l1.6 1.8H20a1 1 0 011 1V18a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button className="fx-icon-btn" title="Import .zip" aria-label="Import zip" onClick={() => zipInputRef.current?.click()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M12 4v3M12 9v2M12 13v2" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button className="fx-icon-btn" title="Export project as .zip" aria-label="Export project" onClick={() => exportProject(ydoc, entries)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 15V3M7 8l5-5 5 5M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {onCollapse && (
            <button className="fx-icon-btn" title="Collapse explorer" aria-label="Collapse explorer" onClick={onCollapse}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) importFileList(ydoc, fileTreeMap, null, e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) importFileList(ydoc, fileTreeMap, null, e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importZip(ydoc, fileTreeMap, null, file);
          e.target.value = "";
        }}
      />

      <div className="fx-tree" onDragEnd={() => setDragState({ draggingId: null, overId: null })}>
        {tree.length === 0 && <div className="fx-empty">No files yet — use the toolbar above.</div>}
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            activeFileId={activeFileId}
            expanded={expanded}
            onToggle={toggle}
            onOpen={openFile}
            onContextMenu={handleContextMenu}
            dragState={dragState}
            setDragState={setDragState}
            onDrop={move}
          />
        ))}
        <div
          className="fx-root-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragState.draggingId) move(dragState.draggingId, null);
            setDragState({ draggingId: null, overId: null });
          }}
        />
      </div>

      {menu && (
        <div
          className="fx-context-menu"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleNewFile}>New File</button>
          <button onClick={handleNewFolder}>New Folder</button>
          <button onClick={handleRename}>Rename</button>
          {menu.node?.type === "file" && <button onClick={handleExportOne}>Export</button>}
          <div className="fx-context-menu__divider" />
          <button className="is-danger" onClick={handleDelete}>Delete</button>
        </div>
      )}
    </aside>
  );
}
