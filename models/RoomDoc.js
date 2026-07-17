const mongoose = require("mongoose");

const roomDocSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, index: true },
  state: { type: Buffer, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RoomDoc", roomDocSchema);