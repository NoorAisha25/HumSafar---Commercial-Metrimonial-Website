import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import ProfileCard from "../components/ProfileCard";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .favorites()
      .then(setFavorites)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AppNavbar />
      <div className="wrap py-10">
        <h1 className="font-display text-3xl font-semibold">Your favorites</h1>
        <p className="mt-1 text-muted">Profiles you've saved to revisit later.</p>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 className="animate-spin" size={18} /> Loading favorites...
          </div>
        )}

        {!loading && error && (
          <EmptyState title="Couldn't reach the server" desc={error} />
        )}

        {!loading && !error && favorites.length === 0 && (
          <EmptyState
            title="No favorites yet"
            desc="Tap the heart on any profile in Discover to save it here."
          />
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <ProfileCard key={f._id} profile={f.profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
