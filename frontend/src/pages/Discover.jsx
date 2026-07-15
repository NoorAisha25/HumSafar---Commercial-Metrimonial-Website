import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import ProfileCard from "../components/ProfileCard";
import EmptyState from "../components/EmptyState";
import { religions, motherTongues, countries } from "../data/mockData";
import { api } from "../lib/api";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [religion, setReligion] = useState("all");
  const [tongue, setTongue] = useState("all");
  const [country, setCountry] = useState("all");
  const [maxAge, setMaxAge] = useState(45);
  const [minAge, setMinAge] = useState(21);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState("match");

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    api
      .discover({
        q: query,
        religion,
        motherTongue: tongue,
        country,
        minAge,
        maxAge,
        verifiedOnly,
        sort,
      })
      .then((res) => !cancelled && setProfiles(res.profiles || []))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query, religion, tongue, country, minAge, maxAge, verifiedOnly, sort]);

  return (
    <div>
      <AppNavbar />
      <div className="wrap py-10">
        <h1 className="font-display text-3xl font-semibold">Discover your match</h1>
        <p className="mt-1 text-muted">
          {loading ? "Searching..." : `${profiles.length} profile${profiles.length === 1 ? "" : "s"} match your preferences`}
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-surface px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, profession..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm"
          >
            <option value="match">match</option>
            <option value="age">age</option>
          </select>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button
                onClick={() => {
                  setReligion("all");
                  setTongue("all");
                  setCountry("all");
                  setMinAge(21);
                  setMaxAge(45);
                  setVerifiedOnly(false);
                }}
                className="text-sm text-rose"
              >
                Reset all
              </button>
            </div>

            <FilterSelect label="Religion" value={religion} onChange={setReligion} options={religions} />
            <FilterSelect label="Mother tongue" value={tongue} onChange={setTongue} options={motherTongues} />
            <FilterSelect label="Country" value={country} onChange={setCountry} options={countries} />

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Age range</span>
                <span className="text-muted">
                  {minAge} - {maxAge}
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={60}
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full accent-rose"
              />
            </div>

            <label className="flex items-center justify-between text-sm">
              <span className="font-medium">Verified only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-4 accent-rose"
              />
            </label>
          </aside>

          <div>
            {loading && (
              <div className="flex items-center justify-center gap-2 py-16 text-muted">
                <Loader2 className="animate-spin" size={18} /> Loading profiles...
              </div>
            )}

            {!loading && error && (
              <EmptyState
                title="Couldn't reach the server"
                desc={`${error} — make sure the backend is running and VITE_API_URL is correct.`}
              />
            )}

            {!loading && !error && profiles.length === 0 && (
              <EmptyState
                title="No profiles match yet"
                desc="As more real members join and complete their profiles, they'll show up here — try widening your filters."
              />
            )}

            {!loading && !error && profiles.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {profiles.map((p) => (
                  <ProfileCard key={p._id} profile={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
        <option value="all">all</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
