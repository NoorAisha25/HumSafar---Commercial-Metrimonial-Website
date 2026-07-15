import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },

    // Only required for email/password accounts — Google accounts have no password.
    password: {
      type: String,
      select: false,
      required: function () {
        return this.authProvider === "local";
      },
    },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googlePicture: String,

    profileFor: { type: String, enum: ["Myself", "Son", "Daughter", "Sibling", "Friend"], default: "Myself" },

    // About You — optional at the schema level so a Google sign-up can create
    // an account instantly, then finish these in a "complete your profile" step.
    gender: { type: String, enum: ["Female", "Male"] },
    dob: Date,
    religion: String,
    motherTongue: String,
    country: String,
    city: String,

    // Preferences
    education: String,
    profession: String,
    preferredAgeMin: { type: Number, default: 21 },
    preferredAgeMax: { type: Number, default: 40 },
    preferredCity: { type: String, default: "Any" },

    photos: [{ url: String, publicId: String }],
    bio: String,

    isVerified: { type: Boolean, default: false },
    verificationDocUrl: String,
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    plan: { type: String, enum: ["free", "premium", "elite"], default: "free" },
    isOnline: { type: Boolean, default: false },
    lastSeen: Date,
  },
  { timestamps: true }
);

// A profile is "complete" (and should show up in Discover / matching) once
// the core matrimonial fields are filled in — relevant for Google sign-ups.
userSchema.virtual("profileComplete").get(function () {
  return Boolean(this.gender && this.dob && this.religion && this.motherTongue && this.country && this.city);
});
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.index({ religion: 1, motherTongue: 1, country: 1 });
userSchema.index({ firstName: "text", lastName: "text", city: "text", profession: "text" });

export default mongoose.model("User", userSchema);
