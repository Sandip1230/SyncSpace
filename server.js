require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const yjsHandler = require("./sockets/yjsHandler");
const roomsRouter = require("./routes/rooms");

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));
app.use("/api/rooms", roomsRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: FRONTEND_ORIGIN }, maxHttpBufferSize: 5e6 });
io.on("connection", (socket) => yjsHandler(io, socket));

server.listen(PORT, () => console.log(`SyncSpace server listening on port ${PORT}`));