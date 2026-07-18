import { useEffect, useMemo } from "react";
import * as Y from "yjs";
import socket from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";

export function useYDoc(roomId) {
  const ydoc = useMemo(() => new Y.Doc(), [roomId]);
  const ytext = useMemo(() => ydoc.getText("code"), [ydoc]);
  const yshapes = useMemo(() => ydoc.getArray("shapes"), [ydoc]);

  useEffect(() => {
    if (!roomId) return undefined;

    const onSync = (state) => Y.applyUpdate(ydoc, new Uint8Array(state));
    const onUpdate = (update) => Y.applyUpdate(ydoc, new Uint8Array(update));
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
      ydoc.destroy();
    };
  }, [ydoc, roomId]);

  return { ydoc, ytext, yshapes };
}