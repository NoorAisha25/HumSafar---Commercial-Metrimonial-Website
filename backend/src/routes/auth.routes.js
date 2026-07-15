import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Event from "../models/Event.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { sendMail, otpEmailTemplate } from "../config/mailer.js";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, profileFor,
      gender, dob, religion, motherTongue, country, city,
      education, profession, preferredAgeMin, preferredAgeMax, preferredCity,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !gender || !dob) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName, lastName, email, password: hashed, profileFor,
      gender, dob, religion, motherTongue, country, city,
      education, profession, preferredAgeMin, preferredAgeMax, preferredCity,
    });

    await Event.create({ type: "signup", user: user._id });

    const { code, expires } = generateOtp();
    user.otpCode = code;
    user.otpExpires = expires;
    await user.save();

    sendMail({
      to: user.email,
      subject: "Welcome to Humsafar — let's verify your email",
      html: otpEmailTemplate(code, firstName),
    }).catch((err) => console.error("Welcome email failed:", err.message));

    const token = signToken(user._id.toString());
    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/google { credential }  — credential is the Google ID token
// from the frontend's Google Identity Services button.
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Missing Google credential" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({ message: "Google account email is not verified" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        firstName: given_name || "New",
        lastName: family_name || "User",
        email,
        authProvider: "google",
        googlePicture: picture,
        isVerified: true, // Google already verified this email address
      });
      await Event.create({ type: "signup", user: user._id, meta: { via: "google" } });
    }

    const token = signToken(user._id.toString());
    res.json({ token, user });
  } catch (err) {
    res.status(401).json({ message: "Google sign-in failed", error: err.message });
  }
});

function generateOtp() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { code, expires };
}

// POST /api/auth/send-otp - (re)send a verification code to the logged-in user
router.post("/send-otp", requireAuth, async (req, res) => {
  const { code, expires } = generateOtp();
  const user = await User.findByIdAndUpdate(
    req.userId,
    { otpCode: code, otpExpires: expires },
    { new: true }
  );

  try {
    await sendMail({
      to: user.email,
      subject: "Your Humsafar verification code",
      html: otpEmailTemplate(code, user.firstName),
    });
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Could not send OTP", error: err.message });
  }
});

// POST /api/auth/verify-otp { code }
router.post("/verify-otp", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("+otpCode +otpExpires");
  if (!user?.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
    return res.status(400).json({ message: "OTP expired, request a new one" });
  }
  if (user.otpCode !== req.body.code) {
    return res.status(400).json({ message: "Incorrect code" });
  }
  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.json({ message: "Email verified" });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id.toString());
    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
