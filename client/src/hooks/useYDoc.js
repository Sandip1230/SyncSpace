import { useEffect, useMemo } from "react";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import socket from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";
import { createUndoManager } from "../lib/yShapes";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
}

export function useYDoc(roomId, username) {
  const ydoc = useMemo(() => new Y.Doc(), [roomId]);
  const fileTreeMap = useMemo(() => ydoc.getMap("fileTree"), [ydoc]);
  const yshapes = useMemo(() => ydoc.getArray("shapes"), [ydoc]);
  const undoManager = useMemo(() => createUndoManager(yshapes), [yshapes]);
  const awareness = useMemo(() => new awarenessProtocol.Awareness(ydoc), [ydoc]);

  useEffect(() => {
    if (!roomId) return undefined;

    const onSync = (state) => Y.applyUpdate(ydoc, new Uint8Array(state), "remote");
    const onUpdate = (update) => Y.applyUpdate(ydoc, new Uint8Array(update), "remote");
    const onLocalUpdate = (update, origin) => {
      if (origin === "remote") return;
      socket.emit(SOCKET_EVENTS.YJS_UPDATE, { roomId, update });
    };

    // Remote collaborators' cursor/selection state comes in over the same
    // socket relay the backend already had — this was the missing wire-up.
    const onAwarenessUpdate = (update) => {
      awarenessProtocol.applyAwarenessUpdate(awareness, new Uint8Array(update), "remote");
    };
    const onAwarenessChange = ({ added, updated, removed }, origin) => {
      if (origin === "remote") return;
      const changed = added.concat(updated).concat(removed);
      const update = awarenessProtocol.encodeAwarenessUpdate(awareness, changed);
      socket.emit(SOCKET_EVENTS.AWARENESS_UPDATE, { roomId, update: Array.from(update) });
    };

    socket.on(SOCKET_EVENTS.YJS_SYNC, onSync);
    socket.on(SOCKET_EVENTS.YJS_UPDATE, onUpdate);
    socket.on(SOCKET_EVENTS.AWARENESS_UPDATE, onAwarenessUpdate);
    ydoc.on("update", onLocalUpdate);
    awareness.on("update", onAwarenessChange);

    awareness.setLocalStateField("user", { name: username || "Anonymous", color: stringToColor(socket.id || username || "user") });

    return () => {
      socket.off(SOCKET_EVENTS.YJS_SYNC, onSync);
      socket.off(SOCKET_EVENTS.YJS_UPDATE, onUpdate);
      socket.off(SOCKET_EVENTS.AWARENESS_UPDATE, onAwarenessUpdate);
      ydoc.off("update", onLocalUpdate);
      awareness.off("update", onAwarenessChange);
      awarenessProtocol.removeAwarenessStates(awareness, [ydoc.clientID], "local");
      undoManager.destroy();
      awareness.destroy();
      ydoc.destroy();
    };
  }, [ydoc, roomId, undoManager, awareness, username]);

  return { ydoc, fileTreeMap, yshapes, undoManager, awareness };
}