import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ owner: 1, profile: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
