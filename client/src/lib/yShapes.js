import * as Y from "yjs";

export function getShapesArray(ydoc) {
  return ydoc.getArray("shapes");
}

export function addShape(shapesArray, shape) {
  shapesArray.push([shape]);
}

export function updateLastShape(shapesArray, patch) {
  const len = shapesArray.length;
  if (len === 0) return;
  const last = shapesArray.get(len - 1);
  shapesArray.delete(len - 1, 1);
  shapesArray.push([{ ...last, ...patch }]);
}

// Updates a shape wherever it sits in the array (delete+reinsert at the
// same index) so moving/editing a shape doesn't change its draw/z-order —
// unlike updateLastShape, which only ever touches the newest entry.
export function updateShapeById(shapesArray, id, patch) {
  const arr = shapesArray.toArray();
  const idx = arr.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const current = arr[idx];
  shapesArray.delete(idx, 1);
  shapesArray.insert(idx, [{ ...current, ...patch }]);
}

export function clearShapes(shapesArray) {
  shapesArray.delete(0, shapesArray.length);
}

export function createUndoManager(shapesArray) {
  return new Y.UndoManager(shapesArray, { captureTimeout: 300 });
}