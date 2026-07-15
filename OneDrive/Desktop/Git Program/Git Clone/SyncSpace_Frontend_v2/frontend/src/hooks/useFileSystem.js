import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildTree,
  createFile,
  createFolder,
  deleteEntry,
  getFileText,
  moveEntry,
  renameEntry,
  seedDefaultTree,
  setLanguage,
  ROOT_ID,
} from "../lib/fileTree";

export function useFileSystem(ydoc, fileTreeMap) {
  const [entries, setEntries] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);

  useEffect(() => {
    const sync = () => setEntries(Array.from(fileTreeMap.values()));
    sync();
    fileTreeMap.observe(sync);
    return () => fileTreeMap.unobserve(sync);
  }, [fileTreeMap]);

  // Seed a starter file once the map has finished its first IndexedDB /
  // Yjs sync pass and turns out to be genuinely empty (new room).
  useEffect(() => {
    if (fileTreeMap.size === 0) {
      const id = seedDefaultTree(ydoc, fileTreeMap);
      if (id) setActiveFileId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the active file pointed at something real: fall back to the
  // first available file if the active one gets deleted or hasn't been
  // picked yet.
  useEffect(() => {
    if (activeFileId && entries.some((e) => e.id === activeFileId && e.type === "file")) return;
    const firstFile = entries.find((e) => e.type === "file");
    setActiveFileId(firstFile ? firstFile.id : null);
  }, [entries, activeFileId]);

  const tree = useMemo(() => buildTree(entries), [entries]);
  const activeFile = useMemo(() => entries.find((e) => e.id === activeFileId) || null, [entries, activeFileId]);
  const activeText = useMemo(() => (activeFileId ? getFileText(ydoc, activeFileId) : null), [ydoc, activeFileId]);

  const actions = useMemo(
    () => ({
      createFile: (parentId, name) => {
        const id = createFile(ydoc, fileTreeMap, parentId ?? ROOT_ID, name);
        setActiveFileId(id);
        return id;
      },
      createFolder: (parentId, name) => createFolder(ydoc, fileTreeMap, parentId ?? ROOT_ID, name),
      rename: (id, name) => renameEntry(ydoc, fileTreeMap, id, name),
      remove: (id) => {
        const deleted = deleteEntry(ydoc, fileTreeMap, id) || [];
        if (deleted.includes(activeFileId)) setActiveFileId(null);
      },
      move: (id, newParentId) => moveEntry(ydoc, fileTreeMap, id, newParentId ?? ROOT_ID),
      setLanguage: (id, language) => setLanguage(ydoc, fileTreeMap, id, language),
      open: (id) => setActiveFileId(id),
    }),
    [ydoc, fileTreeMap, activeFileId]
  );

  const openFile = useCallback((id) => setActiveFileId(id), []);

  return { entries, tree, activeFile, activeFileId, activeText, openFile, ...actions };
}
