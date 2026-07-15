import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

/**
 * useYDoc
 * ---------------------------------------------------------------
 * Owns the single Y.Doc for the current room. Every collaborative
 * surface (file contents, whiteboard shapes) reads/writes through
 * shared types on this one document, which is what makes them
 * mergeable across clients instead of just "shared state."
 *
 *   ydoc.getMap("fileTree")        -> file/folder metadata, one entry per node
 *   ydoc.getText(`content:${id}`)  -> one file's text, bound into Monaco
 *   ydoc.getMap("shapes")          -> whiteboard shapes, one entry per shape
 *
 * The doc itself doesn't know about the network — see
 * lib/socketYjsProvider.js for how updates get relayed between
 * clients over the existing Socket.io connection.
 *
 * A y-indexeddb provider gives real persistence: the whole file tree and
 * every file's content survive a reload / offline session, keyed by room
 * so different rooms don't bleed into each other's local storage.
 */
export function useYDoc(roomId) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const fileTreeMap = useMemo(() => ydoc.getMap("fileTree"), [ydoc]);
  const shapesMap = useMemo(() => ydoc.getMap("shapes"), [ydoc]);
  const [persisted, setPersisted] = useState(false);

  useEffect(() => {
    setPersisted(false);
    if (!roomId) return undefined;
    const persistence = new IndexeddbPersistence(`syncspace:${roomId}`, ydoc);
    persistence.whenSynced.then(() => setPersisted(true));
    return () => {
      persistence.destroy();
    };
  }, [ydoc, roomId]);

  useEffect(() => {
    return () => ydoc.destroy();
  }, [ydoc]);

  return { ydoc, fileTreeMap, shapesMap, persisted };
}
