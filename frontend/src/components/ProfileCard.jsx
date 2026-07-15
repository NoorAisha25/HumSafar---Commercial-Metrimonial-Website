import { Heart, MapPin, GraduationCap, Briefcase, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function ageFromDob(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function fallbackAvatar(name = "U") {
  return `https://ui-avatars.com/api/?background=241717&color=e15a63&size=400&name=${encodeURIComponent(name)}`;
}

export default function ProfileCard({ profile, onView, onSendInterest }) {
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Member";
  const age = ageFromDob(profile.dob);
  const photo = profile.photos?.[0]?.url || profile.photo || fallbackAvatar(name);

  async function toggleSave() {
    setSaved((s) => !s);
    try {
      if (!saved) await api.addFavorite(profile._id);
      else await api.removeFavorite(profile._id);
    } catch {
      // not authenticated or already saved — button state still reflects intent
    }
  }

  async function handleSendInterest() {
    setSent(true);
    if (onSendInterest) onSendInterest(profile);
    else {
      try {
        await api.sendInterest(profile._id);
      } catch {
        // ignore — likely already sent
      }
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/60 bg-surface transition hover:border-rose/40">
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <div className="flex gap-2">
            {profile.plan && profile.plan !== "free" && (
              <span className="rounded-full bg-gold/90 px-3 py-1 text-xs font-semibold text-ink capitalize">
                {profile.plan}
              </span>
            )}
            {profile.isOnline && (
              <span className="flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-cream">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            )}
          </div>
          <button
            onClick={toggleSave}
            aria-label="Save to favorites"
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 transition hover:bg-ink/80 ${
              saved ? "text-rose" : "text-cream"
            }`}
          >
            <Heart size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4">
          <p className="flex items-center gap-1 font-display text-lg font-semibold text-white">
            {name}
            {age ? `, ${age}` : ""}
            {profile.isVerified && <BadgeCheck size={16} className="text-gold" />}
          </p>
          {profile.city && (
            <p className="flex items-center gap-1 text-xs text-cream/80">
              <MapPin size={12} /> {profile.city}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 p-4">
        {profile.education && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <GraduationCap size={14} /> {profile.education}
          </p>
        )}
        {profile.profession && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Briefcase size={14} /> {profile.profession}
          </p>
        )}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-muted">
            {[profile.religion, profile.motherTongue].filter(Boolean).join(" • ")}
          </span>
          {typeof profile.match === "number" && (
            <span className="rounded-full bg-rose/15 px-2.5 py-1 font-semibold text-rose">
              {profile.match}% match
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-3">
          <button
            onClick={handleSendInterest}
            disabled={sent}
            className="flex-1 rounded-full bg-rose py-2 text-sm font-semibold text-white transition hover:bg-rose-dark disabled:opacity-60"
          >
            {sent ? "Sent" : "Send Interest"}
          </button>
          <button
            onClick={() => (onView ? onView(profile) : navigate(`/profile/${profile._id}`))}
            className="flex-1 rounded-full border border-border py-2 text-sm font-semibold text-cream transition hover:border-rose"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
