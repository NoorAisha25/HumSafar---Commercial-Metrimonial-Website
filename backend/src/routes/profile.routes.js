import { Router } from "express";
import multer from "multer";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/profile - the logged-in user's own full profile
router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// GET /api/profile/:id
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Profile not found" });
  res.json(user);
});

// PATCH /api/profile - update the logged-in user's own profile.
// Covers every field collected at registration, so people can edit
// anything they entered when they signed up.
router.patch("/", requireAuth, async (req, res) => {
  const allowed = [
    "firstName", "lastName", "profileFor",
    "gender", "dob", "religion", "motherTongue", "country", "city",
    "education", "profession", "bio",
    "preferredAgeMin", "preferredAgeMax", "preferredCity",
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k) && req.body[k] !== "")
  );
  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });
  res.json(user);
});

// POST /api/profile/photo - uploads to Cloudinary, new photo becomes the primary one
router.post("/photo", requireAuth, upload.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });

  const uploadFromBuffer = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "humsafar/profiles", transformation: [{ width: 800, height: 800, crop: "fill" }] },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

  try {
    const result = await uploadFromBuffer();
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          photos: {
            $each: [{ url: result.secure_url, publicId: result.public_id }],
            $position: 0, // most recent upload becomes the primary/profile photo
          },
        },
      },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

export default router;
