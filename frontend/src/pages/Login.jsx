import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/GoogleAuthButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white">
            <Heart size={18} fill="currentColor" />
          </span>
          <span className="font-display text-xl font-semibold">Humsafar</span>
        </Link>

        <h1 className="text-center font-display text-2xl font-semibold">
          Welcome back
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Log in to continue your search for the right match.
        </p>

        <div className="mt-8 space-y-5">
          <GoogleAuthButton label="Continue with Google" />
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            or continue with email
            <span className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <p className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-rose py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New to Humsafar?{" "}
          <Link to="/register" className="font-medium text-rose">
            Create a free profile
          </Link>
        </p>
      </div>
    </div>
  );
}
