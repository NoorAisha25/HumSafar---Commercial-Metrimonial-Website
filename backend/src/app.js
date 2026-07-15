import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import discoverRoutes from "./routes/discover.routes.js";
import interestsRoutes from "./routes/interests.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/interests", interestsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => res.status(404).json({ message: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

export default app;
