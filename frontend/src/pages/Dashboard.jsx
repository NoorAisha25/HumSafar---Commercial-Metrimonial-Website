import { useEffect, useState } from "react";
import { TrendingUp, Heart, Star, Bell, Check, X, Loader2 } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import ProfileCard from "../components/ProfileCard";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "interests", label: "Interests", icon: Heart },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const { user } = useAuth();

  const [recommended, setRecommended] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.discover({}).catch(() => ({ profiles: [] })),
      api.receivedInterests().catch(() => []),
      api.sentInterests().catch(() => []),
      api.favorites().catch(() => []),
    ])
      .then(([discoverRes, receivedRes, sentRes, favRes]) => {
        if (cancelled) return;
        setRecommended(discoverRes.profiles || []);
        setReceived(receivedRes);
        setSent(sentRes);
        setFavorites(favRes);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function respond(interestId, status) {
    await api.respondInterest(interestId, status);
    setReceived((r) => r.filter((i) => i._id !== interestId));
  }

  async function sendInterest(profile) {
    try {
      await api.sendInterest(profile._id);
    } catch {
      // already sent / self-interest — silently ignore for now
    }
  }

  return (
    <div>
      <AppNavbar notificationCount={received.length} />

      <div className="wrap py-10">
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, {user?.firstName || "there"}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border/60 pb-4">
          {tabs.map((t) => {
            const badge =
              t.key === "interests" ? received.length : t.key === "notifications" ? received.length : 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t.key
                    ? "border border-rose/50 bg-surface-2 text-cream"
                    : "text-muted hover:text-cream"
                }`}
              >
                <t.icon size={15} />
                {t.label}
                {badge > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[11px] font-semibold text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-16 flex items-center justify-center gap-2 text-muted">
            <Loader2 className="animate-spin" size={18} /> Loading your dashboard...
          </div>
        )}

        {!loading && error && (
          <EmptyState
            title="Couldn't reach the server"
            desc={`${error} — make sure the backend is running and VITE_API_URL is correct.`}
          />
        )}

        {!loading && !error && (tab === "overview" || tab === "notifications") && (
          <div className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-xl font-semibold">Recommended for you</h2>
            </div>
            {recommended.length === 0 ? (
              <EmptyState
                title="No matches yet"
                desc="As real members join and complete their profiles, compatible matches will appear here."
              />
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recommended.map((p) => (
                  <ProfileCard key={p._id} profile={p} onSendInterest={sendInterest} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && !error && tab === "interests" && (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-semibold">Received ({received.length})</h2>
              <div className="mt-5 space-y-4">
                {received.length === 0 && (
                  <EmptyState compact title="No interests received yet" />
                )}
                {received.map((i) => (
                  <div key={i._id} className="rounded-2xl border border-border/60 bg-surface p-5 text-center">
                    <img
                      src={i.from.photos?.[0]?.url || fallbackAvatar(i.from.firstName)}
                      alt={i.from.firstName}
                      className="mx-auto h-16 w-16 rounded-full object-cover"
                    />
                    <p className="mt-3 font-display font-semibold">
                      {i.from.firstName} {i.from.lastName}
                    </p>
                    <p className="text-sm text-muted">
                      {i.from.profession} {i.from.city ? `· ${i.from.city}` : ""}
                    </p>
                    <div className="mt-4 flex justify-center gap-3">
                      <button
                        onClick={() => respond(i._id, "accepted")}
                        className="flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white hover:bg-rose-dark"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => respond(i._id, "declined")}
                        className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-cream hover:border-rose"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold">Sent ({sent.length})</h2>
              <div className="mt-5 space-y-4">
                {sent.length === 0 && <EmptyState compact title="You haven't sent any interests yet" />}
                {sent.map((i) => (
                  <div key={i._id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface p-4">
                    <img
                      src={i.to.photos?.[0]?.url || fallbackAvatar(i.to.firstName)}
                      alt={i.to.firstName}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-display font-semibold">
                        {i.to.firstName} {i.to.lastName}
                      </p>
                      <p className="text-sm text-muted">{i.to.profession}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        i.status === "accepted"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : i.status === "declined"
                          ? "bg-border/60 text-muted"
                          : "bg-gold/15 text-gold"
                      }`}
                    >
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && tab === "favorites" && (
          <div className="mt-10">
            {favorites.length === 0 ? (
              <EmptyState title="No favorites yet" desc="Save profiles you're interested in to find them here later." />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {favorites.map((f) => (
                  <ProfileCard key={f._id} profile={f.profile} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function fallbackAvatar(name = "U") {
  return `https://ui-avatars.com/api/?background=241717&color=e15a63&name=${encodeURIComponent(name)}`;
}
