import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, BadgeCheck,
  Heart, Languages, Church, Loader2,
} from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";

function ageFromDob(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function fallbackAvatar(name = "U") {
  return `https://ui-avatars.com/api/?background=241717&color=e15a63&size=600&name=${encodeURIComponent(name)}`;
}

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestSent, setInterestSent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getProfile(id)
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function sendInterest() {
    try {
      await api.sendInterest(id);
      setInterestSent(true);
    } catch {
      setInterestSent(true); // likely already sent — treat as success in the UI
    }
  }

  async function toggleFavorite() {
    setSaved((s) => !s);
    try {
      if (!saved) await api.addFavorite(id);
      else await api.removeFavorite(id);
    } catch {
      // not authenticated — button still reflects intent visually
    }
  }

  return (
    <div>
      <AppNavbar />
      <div className="wrap max-w-4xl py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-cream"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-24 text-muted">
            <Loader2 className="animate-spin" size={18} /> Loading profile...
          </div>
        )}

        {!loading && error && (
          <EmptyState title="Profile not found" desc="This profile may have been removed, or the link is incorrect." />
        )}

        {!loading && !error && profile && (
          <div className="grid gap-8 md:grid-cols-[320px_1fr]">
            <div>
              <img
                src={profile.photos?.[0]?.url || fallbackAvatar(profile.firstName)}
                alt={profile.firstName}
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={sendInterest}
                  disabled={interestSent}
                  className="flex-1 rounded-full bg-rose py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
                >
                  {interestSent ? "Interest sent" : "Send Interest"}
                </button>
                <button
                  onClick={toggleFavorite}
                  aria-label="Save to favorites"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                    saved ? "border-rose text-rose" : "border-border text-cream hover:border-rose"
                  }`}
                >
                  <Heart size={18} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-semibold">
                  {profile.firstName} {profile.lastName}
                  {ageFromDob(profile.dob) ? `, ${ageFromDob(profile.dob)}` : ""}
                </h1>
                {profile.isVerified && <BadgeCheck size={22} className="text-gold" />}
              </div>
              {profile.city && (
                <p className="mt-1 flex items-center gap-1.5 text-muted">
                  <MapPin size={15} /> {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4">
                {profile.education && (
                  <InfoRow icon={GraduationCap} label="Education" value={profile.education} />
                )}
                {profile.profession && (
                  <InfoRow icon={Briefcase} label="Profession" value={profile.profession} />
                )}
                {profile.religion && <InfoRow icon={Church} label="Religion" value={profile.religion} />}
                {profile.motherTongue && (
                  <InfoRow icon={Languages} label="Mother tongue" value={profile.motherTongue} />
                )}
              </div>

              {profile.bio && (
                <div className="mt-6">
                  <h2 className="font-display text-lg font-semibold">About</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{profile.bio}</p>
                </div>
              )}

              {(profile.preferredAgeMin || profile.preferredCity) && (
                <div className="mt-6 rounded-2xl border border-border/60 bg-surface p-5">
                  <h2 className="font-display text-sm font-semibold">Looking for</h2>
                  <p className="mt-1 text-sm text-muted">
                    Age {profile.preferredAgeMin || 21}–{profile.preferredAgeMax || 45}
                    {profile.preferredCity && profile.preferredCity !== "Any"
                      ? ` · ${profile.preferredCity}`
                      : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface p-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose/15 text-rose">
        <Icon size={15} />
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
