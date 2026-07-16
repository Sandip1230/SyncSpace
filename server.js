// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const registerSocketHandlers = require("./sockets");

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGIN },
  maxHttpBufferSize: 5e6, // Yjs updates can be a few hundred KB on big files; default 1MB is tight
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

server.listen(PORT, () => console.log(`SyncSpace server listening on port ${PORT}`));