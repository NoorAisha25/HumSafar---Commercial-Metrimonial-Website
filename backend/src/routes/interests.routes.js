import { Router } from "express";
import Interest from "../models/Interest.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/interests { to }
router.post("/", requireAuth, async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: "'to' user id is required" });
  if (to === req.userId) return res.status(400).json({ message: "Cannot send interest to yourself" });

  try {
    const interest = await Interest.create({ from: req.userId, to });
    await Event.create({ type: "interest_sent", user: req.userId, meta: { to } });
    res.status(201).json(interest);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Interest already sent" });
    res.status(500).json({ message: "Could not send interest", error: err.message });
  }
});

// PATCH /api/interests/:id { status: "accepted" | "declined" }
router.patch("/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "status must be accepted or declined" });
  }
  const interest = await Interest.findOneAndUpdate(
    { _id: req.params.id, to: req.userId },
    { status },
    { new: true }
  );
  if (!interest) return res.status(404).json({ message: "Interest not found" });
  res.json(interest);
});

// GET /api/interests/received
router.get("/received", requireAuth, async (req, res) => {
  const list = await Interest.find({ to: req.userId, status: "pending" })
    .populate("from", "firstName lastName city profession photos");
  res.json(list);
});

// GET /api/interests/sent
router.get("/sent", requireAuth, async (req, res) => {
  const list = await Interest.find({ from: req.userId })
    .populate("to", "firstName lastName city profession photos");
  res.json(list);
});

// GET /api/interests/matches - mutual (accepted) interests in either direction,
// i.e. the people you're allowed to chat with.
router.get("/matches", requireAuth, async (req, res) => {
  const list = await Interest.find({
    status: "accepted",
    $or: [{ from: req.userId }, { to: req.userId }],
  })
    .populate("from", "firstName lastName city profession photos isOnline")
    .populate("to", "firstName lastName city profession photos isOnline");

  const contacts = list.map((i) =>
    i.from._id.toString() === req.userId ? i.to : i.from
  );
  res.json(contacts);
});

export default router;
