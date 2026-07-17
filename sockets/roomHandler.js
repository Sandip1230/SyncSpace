socket.on("room:join", async ({ roomId, username }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username || "Anonymous";

    const room = await getOrCreateRoom(roomId);
    room.users.set(socket.id, { username: socket.data.username });

    socket.emit("room:users", listUsers(roomId));
    socket.to(roomId).emit("room:user-joined", { socketId: socket.id, username: socket.data.username });
  });