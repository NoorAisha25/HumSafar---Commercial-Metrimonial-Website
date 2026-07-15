import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShieldCheck, Lock, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { religions, motherTongues, countries } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

const steps = ["Account", "About You", "Preferences"];

const ageRanges = ["21 - 27", "25 - 32", "28 - 35", "32 - 40", "38 - 48"];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profileFor: "",
    gender: "",
    dob: "",
    religion: "",
    motherTongue: "",
    country: "",
    city: "",
    education: "",
    profession: "",
    preferredAge: "",
    preferredCity: "",
  });

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function next(e) {
    e.preventDefault();
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const [preferredAgeMin, preferredAgeMax] = (form.preferredAge || "21 - 45")
        .split("-")
        .map((n) => parseInt(n.trim(), 10));
      await register({ ...form, preferredAgeMin, preferredAgeMax });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80&auto=format&fit=crop"
          alt="Couple at their wedding"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white">
              <Heart size={18} fill="currentColor" />
            </span>
            <span className="font-display text-xl font-semibold text-white">
              Humsafar
            </span>
          </Link>
          <h2 className="max-w-sm font-display text-3xl font-semibold text-white text-balance">
            Every great love story begins with a single, sincere hello.
          </h2>

          <ul className="mt-10 space-y-4 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-rose" />
              100% verified, ID-checked members
            </li>
            <li className="flex items-center gap-3">
              <Lock size={18} className="text-rose" />
              Private and secure conversations
            </li>
            <li className="flex items-center gap-3">
              <Users size={18} className="text-rose" />
              Real, verified members — not bots or fake profiles
            </li>
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold">
            Create your free profile
          </h1>
          <p className="mt-2 text-sm text-muted">
            Join Humsafar and start your journey to finding the right
            partner.
          </p>

          {/* Stepper */}
          <div className="mt-8 flex items-center">
            {steps.map((label, i) => (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      i < step
                        ? "bg-rose text-white"
                        : i === step
                        ? "bg-rose text-white"
                        : "border border-border text-muted"
                    }`}
                  >
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted">{label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="mx-2 h-px flex-1 bg-border" />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-6 rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
              {error}
            </p>
          )}

          {/* Step 1 */}
          {step === 0 && (
            <div className="mt-8 space-y-5">
              <GoogleAuthButton label="Sign up with Google" />
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-border" />
                or continue with email
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={next} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input
                    required
                    value={form.firstName}
                    onChange={update("firstName")}
                    placeholder="Ayesha"
                    className="input"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    required
                    value={form.lastName}
                    onChange={update("lastName")}
                    placeholder="Khan"
                    className="input"
                  />
                </Field>
              </div>
              <Field label="Email address">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className="input"
                />
              </Field>
              <Field label="Password">
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Create a password"
                  className="input"
                  minLength={8}
                />
              </Field>
              <Field label="Profile is for">
                <select
                  required
                  value={form.profileFor}
                  onChange={update("profileFor")}
                  className="input"
                >
                  <option value="">Select</option>
                  <option>Myself</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Sibling</option>
                  <option>Friend</option>
                </select>
              </Field>

              <SubmitRow />
              </form>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <form onSubmit={next} className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Gender">
                  <select
                    required
                    value={form.gender}
                    onChange={update("gender")}
                    className="input"
                  >
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                  </select>
                </Field>
                <Field label="Date of birth">
                  <input
                    required
                    type="date"
                    value={form.dob}
                    onChange={update("dob")}
                    className="input"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Religion">
                  <select
                    required
                    value={form.religion}
                    onChange={update("religion")}
                    className="input"
                  >
                    <option value="">Select</option>
                    {religions.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Mother tongue">
                  <select
                    required
                    value={form.motherTongue}
                    onChange={update("motherTongue")}
                    className="input"
                  >
                    <option value="">Select</option>
                    {motherTongues.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country">
                  <select
                    required
                    value={form.country}
                    onChange={update("country")}
                    className="input"
                  >
                    <option value="">Select</option>
                    {countries.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="City">
                  <input
                    required
                    value={form.city}
                    onChange={update("city")}
                    placeholder="Lahore"
                    className="input"
                  />
                </Field>
              </div>

              <SubmitRow onBack={back} />
            </form>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <Field label="Highest education">
                <input
                  required
                  value={form.education}
                  onChange={update("education")}
                  placeholder="e.g. MBA, Marketing"
                  className="input"
                />
              </Field>
              <Field label="Profession">
                <input
                  required
                  value={form.profession}
                  onChange={update("profession")}
                  placeholder="e.g. Brand Manager"
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Preferred age">
                  <select
                    value={form.preferredAge}
                    onChange={update("preferredAge")}
                    className="input"
                  >
                    <option value="">Select</option>
                    {ageRanges.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Preferred city">
                  <input
                    value={form.preferredCity}
                    onChange={update("preferredCity")}
                    placeholder="Any"
                    className="input"
                  />
                </Field>
              </div>

              <p className="rounded-xl bg-surface-2 p-4 text-xs text-muted">
                By creating a profile you agree to Humsafar's Terms of Use
                and Privacy Policy. Your details stay private until you
                choose to share them.
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={back}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-cream hover:border-rose"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-rose py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Profile"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Already a member?{" "}
            <Link to="/login" className="font-medium text-rose">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-cream">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitRow({ onBack }) {
  return (
    <div className="flex gap-3 pt-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-cream hover:border-rose"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <button
        type="submit"
        className={`flex items-center justify-center gap-2 rounded-full bg-rose py-3 text-sm font-semibold text-white hover:bg-rose-dark ${
          onBack ? "flex-[2]" : "w-full"
        }`}
      >
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}
