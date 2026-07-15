import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { makeId } from "../lib/id";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

/** Reads ?room= from the URL, or mints one and writes it back so the
 *  session becomes a shareable link — mirrors how every real
 *  collaborative tool hands out room URLs. */
function getOrCreateRoomId() {
  const params = new URLSearchParams(window.location.search);
  let room = params.get("room");
  if (!room) {
    room = makeId("room");
    params.set("room", room);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }
  return room;
}

/**
 * useSocket
 * ---------------------------------------------------------------
 * Wraps the Socket.io connection and joins a "room" using the
 * contract already implemented server-side in sockets/roomHandle.js:
 *
 *   emit  "joinRoom"   (roomId)
 *   emit  "leaveRoom"  (roomId)
 *   on    "userJoined" ({ socketId })
 *   on    "userLeft"   ({ socketId })
 *
 * The editor and whiteboard work fine with the server offline —
 * `connected` just stays false and the doc stays purely local until
 * a connection is available. Nothing here blocks on the network.
 */
export function useSocket() {
  const roomId = useRef(getOrCreateRoomId()).current;
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerIds, setPeerIds] = useState([]);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnectionDelay: 800,
      reconnectionDelayMax: 4000,
    });
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit("joinRoom", roomId);
    };
    const onDisconnect = () => setConnected(false);
    const onUserJoined = ({ socketId }) =>
      setPeerIds((prev) => (prev.includes(socketId) ? prev : [...prev, socketId]));
    const onUserLeft = ({ socketId }) =>
      setPeerIds((prev) => prev.filter((id) => id !== socketId));

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      socket.disconnect();
    };
  }, [roomId]);

  return { socket: socketRef, roomId, connected, peerCount: peerIds.length };
}
