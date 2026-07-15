import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g. "signup", "interest_sent", "profile_view"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
