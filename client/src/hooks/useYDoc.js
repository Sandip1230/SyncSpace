import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness.js";
import socket from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";
import { createUndoManager } from "../lib/yShapes";
import { resolveUserColor } from "../utils/color";
import { useSettings } from "../context/SettingsContext";

export function useYDoc(roomId, username) {
  const { settings } = useSettings();
  const cursorColor = settings.cursorColor;
  const ydoc = useMemo(() => new Y.Doc(), [roomId]);
  const fileTreeMap = useMemo(() => ydoc.getMap("fileTree"), [ydoc]);
  const yshapes = useMemo(() => ydoc.getArray("shapes"), [ydoc]);
  const ychat = useMemo(() => ydoc.getArray("chat"), [ydoc]);
  const undoManager = useMemo(() => createUndoManager(yshapes), [yshapes]);
  const awareness = useMemo(() => new awarenessProtocol.Awareness(ydoc), [ydoc]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!roomId) return undefined;
    setSynced(false);

    const onSync = (state) => {
      Y.applyUpdate(ydoc, new Uint8Array(state), "remote");
      setSynced(true);
    };
    const onUpdate = (update) => Y.applyUpdate(ydoc, new Uint8Array(update), "remote");
    const onLocalUpdate = (update, origin) => {
      if (origin === "remote") return;
      socket.emit(SOCKET_EVENTS.YJS_UPDATE, { roomId, update });
    };

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

    return () => {
      socket.off(SOCKET_EVENTS.YJS_SYNC, onSync);
      socket.off(SOCKET_EVENTS.YJS_UPDATE, onUpdate);
      socket.off(SOCKET_EVENTS.AWARENESS_UPDATE, onAwarenessUpdate);
      ydoc.off("update", onLocalUpdate);
      awareness.off("update", onAwarenessChange);
      awarenessProtocol.removeAwarenessStates(awareness, [ydoc.clientID], "local");
    };
  }, [ydoc, roomId, undoManager, awareness, username]);

  useEffect(() => {
    awareness.setLocalStateField("user", {
      name: username || "Anonymous",
      color: resolveUserColor(socket.id || username || "user", cursorColor),
    });
  }, [awareness, username, cursorColor]);

  return { ydoc, fileTreeMap, yshapes, ychat, undoManager, awareness, synced };
}