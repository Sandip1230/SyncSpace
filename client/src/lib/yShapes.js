// Each shape: { id, tool, color, strokeWidth, points: [x1,y1,x2,y2,...] }
export function getShapesArray(ydoc) {
  return ydoc.getArray("shapes");
}

export function addShape(shapesArray, shape) {
  shapesArray.push([shape]);
}

// Mutating the last point set in place (used while actively drawing) needs
// a delete+reinsert since Y.Array elements aren't deep-observed.
export function updateLastShape(shapesArray, points) {
  const len = shapesArray.length;
  if (len === 0) return;
  const last = shapesArray.get(len - 1);
  shapesArray.delete(len - 1, 1);
  shapesArray.push([{ ...last, points }]);
}

export function clearShapes(shapesArray) {
  shapesArray.delete(0, shapesArray.length);
}

export function undoLastShape(shapesArray) {
  const len = shapesArray.length;
  if (len === 0) return;
  shapesArray.delete(len - 1, 1);
}