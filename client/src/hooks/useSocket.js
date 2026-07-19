import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import { SOCKET_EVENTS } from "../utils/constants";

export function useSocket(roomId, username) {
  const [connected, setConnected] = useState(socket.connected);
  const [connecting, setConnecting] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const joinedRoomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return undefined;

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setConnected(true);
      setConnecting(false);
      socket.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId, username });
      joinedRoomRef.current = roomId;
    };
    const onDisconnect = () => {
      setConnected(false);
      setConnecting(true);
    };
    const onUsers = (list) => setUsers(list);
    const onUserJoined = (u) => setUsers((prev) => [...prev, u]);
    const onUserLeft = ({ socketId }) => setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    const onRoomError = ({ message }) => setError(message);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.ROOM_USERS, onUsers);
    socket.on(SOCKET_EVENTS.ROOM_USER_JOINED, onUserJoined);
    socket.on(SOCKET_EVENTS.ROOM_USER_LEFT, onUserLeft);
    socket.on("room:error", onRoomError);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.ROOM_USERS, onUsers);
      socket.off(SOCKET_EVENTS.ROOM_USER_JOINED, onUserJoined);
      socket.off(SOCKET_EVENTS.ROOM_USER_LEFT, onUserLeft);
      socket.off("room:error", onRoomError);
      if (joinedRoomRef.current) {
        socket.emit(SOCKET_EVENTS.ROOM_LEAVE);
        joinedRoomRef.current = null;
      }
    };
  }, [roomId, username]);

  return { socket, connected, connecting, users, error };
}