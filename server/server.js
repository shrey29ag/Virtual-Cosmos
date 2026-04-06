require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Player = require('./models/Player');

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

const players = new Map();
const activePairs = new Map();

const PROXIMITY_RADIUS = 150; 

function euclidean(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function roomId(userIdA, userIdB) {
  return [userIdA, userIdB].sort().join('::');
}

function evaluateProximity(updatedPlayer) {
  for (const [otherId, otherPlayer] of players) {
    if (otherId === updatedPlayer.userId) continue;

    const dist = euclidean(updatedPlayer, otherPlayer);
    const rid = roomId(updatedPlayer.userId, otherId);

    if (dist < PROXIMITY_RADIUS) {

      if (!activePairs.has(rid)) {
        activePairs.set(rid, new Set([updatedPlayer.userId, otherId]));

        const payload = { roomId: rid, partnerUserId: otherId, partnerUsername: otherPlayer.username };
        io.to(updatedPlayer.socketId).emit('proximity:enter', payload);

        const otherPayload = {
          roomId: rid,
          partnerUserId: updatedPlayer.userId,
          partnerUsername: updatedPlayer.username,
        };
        if (otherPlayer.socketId) io.to(otherPlayer.socketId).emit('proximity:enter', otherPayload);
      }
    } else {

      if (activePairs.has(rid)) {
        activePairs.delete(rid);

        io.to(updatedPlayer.socketId).emit('proximity:leave', { roomId: rid });
        if (otherPlayer.socketId) io.to(otherPlayer.socketId).emit('proximity:leave', { roomId: rid });
      }
    }
  }
}

app.post('/api/join', async (req, res) => {
  try {
    const { username, avatarIndex } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });

    const userId = uuidv4();

    Player.create({
      userId,
      username,
      avatarIndex: avatarIndex ?? 0,
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100,
    }).catch((err) => console.warn('[mongo]', err.message));

    return res.json({ userId, username, avatarIndex: avatarIndex ?? 0 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.get('/api/players', (_req, res) => {
  return res.json(Array.from(players.values()));
});

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on('player:join', ({ userId, username, avatarIndex, x, y }) => {
    const player = {
      userId,
      username,
      avatarIndex: avatarIndex ?? 0,
      x: x ?? 400 + Math.random() * 200 - 100,
      y: y ?? 300 + Math.random() * 200 - 100,
      socketId: socket.id,
    };
    players.set(userId, player);
    socket.data.userId = userId;

    socket.emit('players:snapshot', Array.from(players.values()));

    socket.broadcast.emit('player:joined', player);

    evaluateProximity(player);

    console.log(`[join] ${username} (${userId})`);
  });

  socket.on('player:move', ({ userId, x, y }) => {
    const player = players.get(userId);
    if (!player) return;

    player.x = x;
    player.y = y;
    players.set(userId, player);

    io.emit('player:moved', { userId, x, y });

    evaluateProximity(player);
  });

  socket.on('chat:message', ({ id, roomId: rid, senderId, senderName, text, timestamp }) => {

    let recipientIds = activePairs.has(rid) ? activePairs.get(rid) : null;

    if (!recipientIds) {

      const [idA, idB] = rid.split('::');
      const playerA = players.get(idA);
      const playerB = players.get(idB);
      if (playerA && playerB && euclidean(playerA, playerB) < PROXIMITY_RADIUS * 1.5) {

        activePairs.set(rid, new Set([idA, idB]));
        recipientIds = activePairs.get(rid);
      }
    }

    if (!recipientIds) return; 

    recipientIds.forEach((uid) => {
      const target = players.get(uid);
      if (target?.socketId) {
        io.to(target.socketId).emit('chat:message', { id, roomId: rid, senderId, senderName, text, timestamp });
      }
    });
  });

  socket.on('chat:typing', ({ roomId: rid, senderId }) => {
    if (!rid || !activePairs.has(rid)) return;

    activePairs.get(rid).forEach((uid) => {
      if (uid === senderId) return;
      const target = players.get(uid);
      if (target?.socketId) {
        io.to(target.socketId).emit('chat:typing', { roomId: rid, senderId });
      }
    });
  });

  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (!userId) return;

    const player = players.get(userId);
    players.delete(userId);

    for (const [rid, members] of activePairs) {
      if (members.has(userId)) {
        activePairs.delete(rid);

        members.forEach((uid) => {
          if (uid !== userId) {
            const other = players.get(uid);
            if (other?.socketId) io.to(other.socketId).emit('proximity:leave', { roomId: rid });
          }
        });
      }
    }

    io.emit('player:left', { userId });

    Player.findOneAndUpdate({ userId }, { isOnline: false }).catch(() => {});

    console.log(`[disconnect] ${player?.username ?? userId}`);
  });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('[mongo] connected'))
  .catch((err) => console.warn('[mongo] running without DB:', err.message));

httpServer.listen(PORT, () => {
  console.log(`[server] Virtual Cosmos running on http://localhost:${PORT}`);
});
