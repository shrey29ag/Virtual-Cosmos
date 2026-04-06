const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatarIndex: { type: Number, default: 0 },
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 },
    socketId: { type: String },
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
