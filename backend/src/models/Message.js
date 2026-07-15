import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true }, // sorted pair of user ids joined with "_"
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readAt: Date,
  },
  { timestamps: true }
);

export function conversationIdFor(userA, userB) {
  return [userA, userB].sort().join("_");
}

export default mongoose.model("Message", messageSchema);
