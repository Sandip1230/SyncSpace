/**
 * Small, dependency-free unique id generator.
 * Good enough for CRDT map keys (shape ids) — doesn't need to be
 * cryptographically strong, just collision-resistant within a session.
 */
export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}
