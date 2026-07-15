import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptLoadingPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;
  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

/**
 * Renders Google's official "Sign in with Google" button. The button hands
 * us a signed ID token (JWT) which we forward to POST /api/auth/google —
 * the backend verifies it with google-auth-library before trusting it.
 */
export default function GoogleAuthButton({ label = "Continue with Google" }) {
  const ref = useRef(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [unconfigured, setUnconfigured] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setUnconfigured(true);
      return;
    }

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              await loginWithGoogle(credential);
              navigate("/dashboard");
            } catch (err) {
              setError(err.message || "Google sign-in failed");
            }
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: 360,
          text: label.toLowerCase().includes("sign up") ? "signup_with" : "continue_with",
        });
      })
      .catch(() => setError("Could not load Google sign-in"));

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, navigate, label]);

  if (unconfigured) {
    // Fails gracefully in local dev before VITE_GOOGLE_CLIENT_ID is set,
    // instead of silently rendering nothing.
    return (
      <button
        type="button"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID in frontend/.env to enable this"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-muted opacity-60"
      >
        {label} (not configured)
      </button>
    );
  }

  return (
    <div className="flex justify-center">
      <div ref={ref} />
      {error && <p className="mt-2 text-center text-xs text-rose">{error}</p>}
    </div>
  );
}
