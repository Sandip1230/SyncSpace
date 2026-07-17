socket.on("room:join", async ({ roomId }) => {
    if (!roomId) return;
    const room = await getOrCreateRoom(roomId);
    socket.emit("yjs:sync", Buffer.from(Y.encodeStateAsUpdate(room.doc)));
  });