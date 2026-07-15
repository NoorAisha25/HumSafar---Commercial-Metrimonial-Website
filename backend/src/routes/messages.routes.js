import { Router } from "express";
import Message, { conversationIdFor } from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/messages/:otherUserId - conversation history
router.get("/:otherUserId", requireAuth, async (req, res) => {
  const conversationId = conversationIdFor(req.userId, req.params.otherUserId);
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  res.json(messages);
});

export default router;
