import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function ageFromDob(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

// GET /api/discover/featured - public preview for the logged-out landing page.
// Only returns real registered members (verified first), never fabricated ones.
router.get("/featured", async (_req, res) => {
  const profiles = await User.find({ gender: { $exists: true } })
    .sort({ isVerified: -1, createdAt: -1 })
    .limit(4)
    .select("firstName lastName city profession education religion motherTongue photos isVerified isOnline plan dob");
  res.json({ profiles });
});

// Simple rule-based compatibility score (0-100). Runs in application code —
// this is the "matching engine" from the MVP stack doc, no ML service needed.
function matchScore(me, other) {
  let score = 50;
  if (me.religion && me.religion === other.religion) score += 20;
  if (me.motherTongue && me.motherTongue === other.motherTongue) score += 15;
  if (me.country && me.country === other.country) score += 10;
  const age = ageFromDob(other.dob);
  if (age >= (me.preferredAgeMin ?? 21) && age <= (me.preferredAgeMax ?? 45)) score += 5;
  return Math.min(score, 99);
}

// GET /api/discover?religion=&motherTongue=&country=&minAge=&maxAge=&q=&verifiedOnly=&sort=
router.get("/", requireAuth, async (req, res) => {
  const { religion, motherTongue, country, minAge, maxAge, q, verifiedOnly, sort } = req.query;

  const me = await User.findById(req.userId);
  const filter = { _id: { $ne: req.userId }, gender: me.gender === "Female" ? "Male" : "Female" };

  if (religion && religion !== "all") filter.religion = religion;
  if (motherTongue && motherTongue !== "all") filter.motherTongue = motherTongue;
  if (country && country !== "all") filter.country = country;
  if (verifiedOnly === "true") filter.isVerified = true;
  if (q) filter.$text = { $search: q };

  let results = await User.find(filter).limit(100);

  if (minAge || maxAge) {
    results = results.filter((u) => {
      const age = ageFromDob(u.dob);
      return age >= Number(minAge || 18) && age <= Number(maxAge || 99);
    });
  }

  let withScore = results.map((u) => ({ user: u, match: matchScore(me, u) }));

  if (sort === "age") withScore.sort((a, b) => ageFromDob(a.user.dob) - ageFromDob(b.user.dob));
  else withScore.sort((a, b) => b.match - a.match);

  res.json({
    count: withScore.length,
    profiles: withScore.map(({ user, match }) => ({ ...user.toObject(), match })),
  });
});

export default router;
