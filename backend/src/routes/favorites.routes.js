import { Router } from "express";
import Favorite from "../models/Favorite.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/favorites
router.get("/", requireAuth, async (req, res) => {
  const list = await Favorite.find({ owner: req.userId }).populate("profile");
  res.json(list);
});

// POST /api/favorites { profile }
router.post("/", requireAuth, async (req, res) => {
  try {
    const fav = await Favorite.create({ owner: req.userId, profile: req.body.profile });
    res.status(201).json(fav);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Already in favorites" });
    res.status(500).json({ message: "Could not save favorite", error: err.message });
  }
});

// DELETE /api/favorites/:profileId
router.delete("/:profileId", requireAuth, async (req, res) => {
  await Favorite.findOneAndDelete({ owner: req.userId, profile: req.params.profileId });
  res.status(204).end();
});

export default router;
