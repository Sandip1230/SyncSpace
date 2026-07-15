import JSZip from "jszip";
import { createFile, createFolder, getFileText, pathForEntry } from "./fileTree";

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportFile(ydoc, entries, fileId) {
  const entry = entries.find((e) => e.id === fileId);
  if (!entry) return;
  const text = getFileText(ydoc, fileId).toString();
  downloadBlob(new Blob([text], { type: "text/plain" }), entry.name);
}

export async function exportProject(ydoc, entries, projectName = "syncspace-project") {
  const zip = new JSZip();
  entries
    .filter((e) => e.type === "file")
    .forEach((entry) => {
      const path = pathForEntry(entries, entry.id);
      zip.file(path, getFileText(ydoc, entry.id).toString());
    });
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${projectName}.zip`);
}

/** Imports a flat FileList (from an <input type="file"> or a
 * webkitdirectory picker) into the tree, recreating folder structure from
 * webkitRelativePath when present. */
export function importFileList(ydoc, fileTreeMap, parentId, fileList) {
  const folderIdByPath = new Map();

  function ensureFolderPath(relDir) {
    if (!relDir) return parentId;
    if (folderIdByPath.has(relDir)) return folderIdByPath.get(relDir);
    const segments = relDir.split("/").filter(Boolean);
    let cur = parentId;
    let builtPath = "";
    segments.forEach((seg) => {
      builtPath = builtPath ? `${builtPath}/${seg}` : seg;
      if (folderIdByPath.has(builtPath)) {
        cur = folderIdByPath.get(builtPath);
      } else {
        const id = createFolder(ydoc, fileTreeMap, cur, seg);
        folderIdByPath.set(builtPath, id);
        cur = id;
      }
    });
    return cur;
  }

  const readers = Array.from(fileList).map(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file, text: reader.result });
        reader.onerror = reject;
        reader.readAsText(file);
      })
  );

  return Promise.all(readers).then((results) => {
    results.forEach(({ file, text }) => {
      const relPath = file.webkitRelativePath || file.name;
      const segments = relPath.split("/");
      const name = segments.pop();
      const dir = segments.join("/");
      const targetParent = ensureFolderPath(dir);
      const id = createFile(ydoc, fileTreeMap, targetParent, name);
      getFileText(ydoc, id).insert(0, text);
    });
  });
}

export async function importZip(ydoc, fileTreeMap, parentId, zipFile) {
  const zip = await JSZip.loadAsync(zipFile);
  const folderIdByPath = new Map();

  function ensureFolderPath(relDir) {
    if (!relDir) return parentId;
    if (folderIdByPath.has(relDir)) return folderIdByPath.get(relDir);
    const segments = relDir.split("/").filter(Boolean);
    let cur = parentId;
    let builtPath = "";
    segments.forEach((seg) => {
      builtPath = builtPath ? `${builtPath}/${seg}` : seg;
      if (folderIdByPath.has(builtPath)) {
        cur = folderIdByPath.get(builtPath);
      } else {
        const id = createFolder(ydoc, fileTreeMap, cur, seg);
        folderIdByPath.set(builtPath, id);
        cur = id;
      }
    });
    return cur;
  }

  const entries = Object.values(zip.files).filter((f) => !f.dir);
  for (const entry of entries) {
    const segments = entry.name.split("/");
    const name = segments.pop();
    const dir = segments.join("/");
    const targetParent = ensureFolderPath(dir);
    const text = await entry.async("string");
    const id = createFile(ydoc, fileTreeMap, targetParent, name);
    getFileText(ydoc, id).insert(0, text);
  }
}
