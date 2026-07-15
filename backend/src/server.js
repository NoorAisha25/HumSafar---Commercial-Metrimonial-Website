import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { registerChatSocket } from "./sockets/chat.socket.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
  });

  registerChatSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`Humsafar API listening on http://localhost:${PORT}`);
  });
}

start();
