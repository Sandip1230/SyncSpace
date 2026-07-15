import * as Y from "yjs";

/**
 * attachSocketYjsProvider
 * ---------------------------------------------------------------
 * A minimal Yjs <-> Socket.io bridge. This is intentionally the
 * simplest thing that can work correctly, not a full reimplementation
 * of y-websocket — good enough for Week 1-2, easy to reason about,
 * and easy to swap out later without touching any component code
 * (everything here talks to the Y.Doc, never to React).
 *
 * Local change  -> encode as a Yjs update -> emit over the socket
 * Remote update -> Y.applyUpdate(doc, update, "remote")
 *
 * Updates applied with origin "remote" don't get re-broadcast,
 * which is what stops an infinite echo loop between clients.
 *
 * REQUIRED SERVER-SIDE CONTRACT (see server-additions/yjsRelay.js
 * for a ready-to-paste implementation matching this exactly):
 *
 *   emit "yjs-sync-request"  { roomId }
 *        -> ask the room for the current full document state
 *   on   "yjs-sync-response" { update: base64 }
 *        -> apply once, to catch up a client that joined late
 *   emit "yjs-update"        { roomId, update: base64 }
 *        -> broadcast a local change to the room
 *   on   "yjs-update"        { update: base64 }
 *        -> apply an update made by someone else in the room
 *
 * Until that server relay exists, this provider degrades gracefully:
 * the Y.Doc still works perfectly as a local CRDT, it just won't
 * sync across browser tabs yet.
 */
export function attachSocketYjsProvider(ydoc, socketRef, roomId) {
  const socket = socketRef.current;
  if (!socket) return () => {};

  const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
  const fromBase64 = (str) =>
    Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

  const onDocUpdate = (update, origin) => {
    if (origin === "remote") return; // don't echo back what we just received
    socket.emit("yjs-update", { roomId, update: toBase64(update) });
  };

  const onRemoteUpdate = ({ update }) => {
    Y.applyUpdate(ydoc, fromBase64(update), "remote");
  };

  const onSyncResponse = ({ update }) => {
    Y.applyUpdate(ydoc, fromBase64(update), "remote");
  };

  const requestSync = () => socket.emit("yjs-sync-request", { roomId });

  ydoc.on("update", onDocUpdate);
  socket.on("yjs-update", onRemoteUpdate);
  socket.on("yjs-sync-response", onSyncResponse);
  socket.on("connect", requestSync);
  if (socket.connected) requestSync();

  return function detach() {
    ydoc.off("update", onDocUpdate);
    socket.off("yjs-update", onRemoteUpdate);
    socket.off("yjs-sync-response", onSyncResponse);
    socket.off("connect", requestSync);
  };
}
