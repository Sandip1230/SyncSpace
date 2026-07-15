import { makeId } from "./id";

export const ROOT_ID = null;

export const EXTENSION_LANGUAGE = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  txt: "plaintext",
  css: "css",
  html: "html",
};

export function languageForName(name) {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  return EXTENSION_LANGUAGE[ext] || "plaintext";
}

export function contentKey(fileId) {
  return `content:${fileId}`;
}

/** Returns the shared Y.Text backing a file's content, creating it if needed. */
export function getFileText(ydoc, fileId) {
  return ydoc.getText(contentKey(fileId));
}

/** Runnable = we have a real in-browser execution path for this language. */
export function isRunnable(language) {
  return language === "javascript" || language === "typescript";
}

function nextOrder(fileTreeMap, parentId) {
  let max = -1;
  fileTreeMap.forEach((entry) => {
    if (entry.parentId === parentId && entry.order > max) max = entry.order;
  });
  return max + 1;
}

export function seedDefaultTree(ydoc, fileTreeMap) {
  if (fileTreeMap.size > 0) return;
  const id = makeId("file");
  ydoc.transact(() => {
    fileTreeMap.set(id, {
      id,
      name: "session.js",
      type: "file",
      parentId: ROOT_ID,
      language: "javascript",
      order: 0,
    });
  });
  getFileText(ydoc, id).insert(
    0,
    "// Welcome to SyncSpace\n// Everyone in this room edits this file together.\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet(\"world\"));\n"
  );
  return id;
}

export function createFile(ydoc, fileTreeMap, parentId, name) {
  const id = makeId("file");
  const language = languageForName(name);
  ydoc.transact(() => {
    fileTreeMap.set(id, {
      id,
      name,
      type: "file",
      parentId,
      language,
      order: nextOrder(fileTreeMap, parentId),
    });
  });
  return id;
}

export function createFolder(ydoc, fileTreeMap, parentId, name) {
  const id = makeId("folder");
  ydoc.transact(() => {
    fileTreeMap.set(id, {
      id,
      name,
      type: "folder",
      parentId,
      order: nextOrder(fileTreeMap, parentId),
    });
  });
  return id;
}

export function renameEntry(ydoc, fileTreeMap, id, name) {
  const entry = fileTreeMap.get(id);
  if (!entry) return;
  ydoc.transact(() => {
    fileTreeMap.set(id, {
      ...entry,
      name,
      language: entry.type === "file" ? languageForName(name) : undefined,
    });
  });
}

export function setLanguage(ydoc, fileTreeMap, id, language) {
  const entry = fileTreeMap.get(id);
  if (!entry || entry.type !== "file") return;
  ydoc.transact(() => fileTreeMap.set(id, { ...entry, language }));
}

function collectDescendants(fileTreeMap, id, acc) {
  fileTreeMap.forEach((entry) => {
    if (entry.parentId === id) {
      acc.push(entry.id);
      if (entry.type === "folder") collectDescendants(fileTreeMap, entry.id, acc);
    }
  });
  return acc;
}

export function deleteEntry(ydoc, fileTreeMap, id) {
  const entry = fileTreeMap.get(id);
  if (!entry) return;
  const toDelete = entry.type === "folder" ? [id, ...collectDescendants(fileTreeMap, id, [])] : [id];
  ydoc.transact(() => {
    toDelete.forEach((entryId) => {
      const e = fileTreeMap.get(entryId);
      fileTreeMap.delete(entryId);
      if (e && e.type === "file") {
        // Clearing rather than deleting the Y.Text (Yjs has no "delete a
        // shared type" op); an orphaned empty text costs nothing.
        const text = getFileText(ydoc, entryId);
        if (text.length) text.delete(0, text.length);
      }
    });
  });
  return toDelete;
}

export function moveEntry(ydoc, fileTreeMap, id, newParentId) {
  const entry = fileTreeMap.get(id);
  if (!entry) return;
  // Guard against dropping a folder into its own subtree.
  if (entry.type === "folder") {
    const descendants = new Set(collectDescendants(fileTreeMap, id, []));
    if (descendants.has(newParentId)) return;
  }
  ydoc.transact(() => {
    fileTreeMap.set(id, {
      ...entry,
      parentId: newParentId,
      order: nextOrder(fileTreeMap, newParentId),
    });
  });
}

export function buildTree(entries) {
  const byParent = new Map();
  entries.forEach((entry) => {
    const list = byParent.get(entry.parentId) || [];
    list.push(entry);
    byParent.set(entry.parentId, list);
  });
  byParent.forEach((list) => list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)));

  function attach(parentId) {
    return (byParent.get(parentId) || []).map((entry) => ({
      ...entry,
      children: entry.type === "folder" ? attach(entry.id) : undefined,
    }));
  }
  return attach(ROOT_ID);
}

export function pathForEntry(entries, id) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const parts = [];
  let cur = byId.get(id);
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parentId == null ? null : byId.get(cur.parentId);
  }
  return parts.join("/");
}
