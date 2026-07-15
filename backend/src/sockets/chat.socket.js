import jwt from "jsonwebtoken";
import Message, { conversationIdFor } from "../models/Message.js";
import User from "../models/User.js";

export function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    socket.join(socket.userId); // personal room for direct delivery

    socket.on("message:send", async ({ to, text }, ack) => {
      const conversationId = conversationIdFor(socket.userId, to);
      const message = await Message.create({ conversationId, from: socket.userId, to, text });
      io.to(to).to(socket.userId).emit("message:new", message);
      ack?.({ ok: true, message });
    });

    socket.on("typing", ({ to }) => {
      io.to(to).emit("typing", { from: socket.userId });
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
    });
  });
}
