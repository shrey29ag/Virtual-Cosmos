# 🌌 Virtual Cosmos

A 2D proximity-based full-stack multiplayer environment where users can freely navigate their avatars and converse with other players strictly when they are inside each other's proximity radius. 

Built with an emphasis on a premium, highly-responsive feeling, integrating a hardware-accelerated canvas engine.

## ✨ Features
- **Real-Time Multiplayer:** Built on WebSockets via `socket.io` for snappy, low-latency state synchronization.
- **2D Game World:** Driven by `PixiJS` for a smooth, GPU-accelerated navigable cosmos map.
- **Proximity Detection:** Implements active Euclidean distance logic limiting users exclusively to chat when within a 150-logical-pixel radius of one another.
- **Responsive Click-to-Move & WASD:** Dynamic, predictable movement constraints combined with logical screen bounds mapping.
- **Glassmorphism UI:** Complete frontend layer using `React`, `Vite`, and `Tailwind CSS` styled with a cosmic neon asthetic.

## 🧰 Tech Stack
- **Frontend:** React, Vite, PixiJS, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB / Mongoose

---

## 🚀 Setup & Run Instructions

This application is split into two root folders: `client/` and `server/`.

### 1. Backend Server Setup

1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure an `.env` file exists in the `server` directory with:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   ```
   *(Note: The server will still run and function in a degrading fallback state even if MongoDB is not provided)*
4. Start the server:
   ```bash
   npm run start
   # or
   node server.js
   ```
   The backend should now run persistently at `http://localhost:4000`

### 2. Frontend Client Setup

1. Open a **new** terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. **Play!**  
   Open your browser and navigate to `http://localhost:5173`. 
   *(Pro-tip: Open two tabs to simulate multiple users and test the proximity chat!)*

---

### How to use
- Enter any username and select an avatar on the Join Screen.
- Use **W, A, S, D** or the **Arrow Keys** to move across the stars.
- Alternatively, **Click** anywhere on the canvas to auto-glide to that coordinate.
- When you are near another player, a proximity alert triggers, opening your chat panel. Moving out of range closes logic and breaks connection.
