import { useEffect, useState } from "react";
import { Camera, Loader2, Check } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { religions, motherTongues, countries } from "../data/mockData";

function toDateInputValue(dob) {
  if (!dob) return "";
  return new Date(dob).toISOString().slice(0, 10);
}

function fallbackAvatar(name = "U") {
  return `https://ui-avatars.com/api/?background=241717&color=e15a63&size=400&name=${encodeURIComponent(name)}`;
}

export default function EditProfile() {
  const { user, setUser, refreshUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myProfile()
      .then((u) =>
        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          gender: u.gender || "",
          dob: toDateInputValue(u.dob),
          religion: u.religion || "",
          motherTongue: u.motherTongue || "",
          country: u.country || "",
          city: u.city || "",
          education: u.education || "",
          profession: u.profession || "",
          bio: u.bio || "",
          preferredAgeMin: u.preferredAgeMin ?? 21,
          preferredAgeMax: u.preferredAgeMax ?? 40,
          preferredCity: u.preferredCity || "",
          photos: u.photos || [],
        })
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }));

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const updated = await api.uploadProfilePhoto(file);
      setForm((f) => ({ ...f, photos: updated.photos }));
      setUser(updated);
    } catch (err) {
      setError(err.message || "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await api.updateProfile(form);
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div>
        <AppNavbar />
        <div className="wrap flex items-center justify-center gap-2 py-24 text-muted">
          <Loader2 className="animate-spin" size={18} /> Loading your profile...
        </div>
      </div>
    );
  }

  const avatar = form.photos?.[0]?.url || user?.googlePicture || fallbackAvatar(form.firstName);

  return (
    <div>
      <AppNavbar />
      <div className="wrap max-w-3xl py-10">
        <h1 className="font-display text-3xl font-semibold">Edit your profile</h1>
        <p className="mt-1 text-muted">
          Update anything you entered when you registered — it's saved instantly to your account.
        </p>

        {/* Photo */}
        <div className="mt-8 flex items-center gap-6 rounded-2xl border border-border/60 bg-surface p-6">
          <div className="relative">
            <img src={avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-rose text-white shadow-lg hover:bg-rose-dark">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="font-display font-semibold">Profile photo</p>
            <p className="text-sm text-muted">JPG or PNG, up to 5MB. This is what other members see first.</p>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-8">
          <Section title="Account">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name">
                <input required value={form.firstName} onChange={update("firstName")} className="input" />
              </Field>
              <Field label="Last name">
                <input required value={form.lastName} onChange={update("lastName")} className="input" />
              </Field>
            </div>
          </Section>

          <Section title="About you">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender">
                <select value={form.gender} onChange={update("gender")} className="input">
                  <option value="">Select</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </Field>
              <Field label="Date of birth">
                <input type="date" value={form.dob} onChange={update("dob")} className="input" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Religion">
                <select value={form.religion} onChange={update("religion")} className="input">
                  <option value="">Select</option>
                  {religions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Mother tongue">
                <select value={form.motherTongue} onChange={update("motherTongue")} className="input">
                  <option value="">Select</option>
                  {motherTongues.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Country">
                <select value={form.country} onChange={update("country")} className="input">
                  <option value="">Select</option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="City">
                <input value={form.city} onChange={update("city")} className="input" />
              </Field>
            </div>
          </Section>

          <Section title="Career & preferences">
            <Field label="Highest education">
              <input value={form.education} onChange={update("education")} className="input" />
            </Field>
            <Field label="Profession">
              <input value={form.profession} onChange={update("profession")} className="input" />
            </Field>
            <Field label="About me">
              <textarea
                value={form.bio}
                onChange={update("bio")}
                rows={4}
                placeholder="Tell potential matches a bit about yourself..."
                className="input resize-none"
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Preferred age (min)">
                <input type="number" min={18} max={80} value={form.preferredAgeMin} onChange={update("preferredAgeMin")} className="input" />
              </Field>
              <Field label="Preferred age (max)">
                <input type="number" min={18} max={80} value={form.preferredAgeMax} onChange={update("preferredAgeMax")} className="input" />
              </Field>
              <Field label="Preferred city">
                <input value={form.preferredCity} onChange={update("preferredCity")} placeholder="Any" className="input" />
              </Field>
            </div>
          </Section>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-cream">{label}</span>
      {children}
    </label>
  );
}
