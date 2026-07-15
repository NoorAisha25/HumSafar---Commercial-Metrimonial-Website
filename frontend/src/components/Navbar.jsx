import { Heart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { label: "Browse Profiles", href: "/browse" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Success Stories", id: "success-stories" },
  { label: "Membership", id: "membership" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  function goToSection(id) {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate home first, then scroll once the landing page has rendered.
      navigate("/", { state: { scrollTo: id } });
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-ink/90 backdrop-blur">
      <div className="wrap flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white">
            <Heart size={18} fill="currentColor" />
          </span>
          <span className="font-display text-xl font-semibold tracking-wide">
            Humsafar
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map((l) =>
            l.href ? (
              <Link key={l.label} to={l.href} className="transition hover:text-cream">
                {l.label}
              </Link>
            ) : (
              <button
                key={l.label}
                type="button"
                onClick={() => goToSection(l.id)}
                className="transition hover:text-cream"
              >
                {l.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-cream hover:text-rose">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose/30 transition hover:bg-rose-dark"
          >
            Register Free
          </Link>
        </div>
      </div>
    </header>
  );
}
