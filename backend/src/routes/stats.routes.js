import { Router } from "express";
import User from "../models/User.js";
import Interest from "../models/Interest.js";

const router = Router();

// GET /api/stats - powers the "2M+ members" style live counters on the landing page
router.get("/", async (_req, res) => {
  const [memberCount, successStories] = await Promise.all([
    User.countDocuments(),
    Interest.countDocuments({ status: "accepted" }),
  ]);
  res.json({ memberCount, successStories });
});

export default router;
