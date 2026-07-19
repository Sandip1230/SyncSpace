import { useEffect, useMemo } from "react";
import * as Y from "yjs";
import socket from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";
import { createUndoManager } from "../lib/yShapes";

export function useYDoc(roomId) {
  const ydoc = useMemo(() => new Y.Doc(), [roomId]);
  const fileTreeMap = useMemo(() => ydoc.getMap("fileTree"), [ydoc]);
  const yshapes = useMemo(() => ydoc.getArray("shapes"), [ydoc]);
  const undoManager = useMemo(() => createUndoManager(yshapes), [yshapes]);

  useEffect(() => {
    if (!roomId) return undefined;

    const onSync = (state) => Y.applyUpdate(ydoc, new Uint8Array(state), "remote");
    const onUpdate = (update) => Y.applyUpdate(ydoc, new Uint8Array(update), "remote");
    const onLocalUpdate = (update, origin) => {
      if (origin === "remote") return;
      socket.emit(SOCKET_EVENTS.YJS_UPDATE, { roomId, update });
    };

    socket.on(SOCKET_EVENTS.YJS_SYNC, onSync);
    socket.on(SOCKET_EVENTS.YJS_UPDATE, onUpdate);
    ydoc.on("update", onLocalUpdate);

    return () => {
      socket.off(SOCKET_EVENTS.YJS_SYNC, onSync);
      socket.off(SOCKET_EVENTS.YJS_UPDATE, onUpdate);
      ydoc.off("update", onLocalUpdate);
      undoManager.destroy();
      ydoc.destroy();
    };
  }, [ydoc, roomId, undoManager]);

  return { ydoc, fileTreeMap, yshapes, undoManager };
}