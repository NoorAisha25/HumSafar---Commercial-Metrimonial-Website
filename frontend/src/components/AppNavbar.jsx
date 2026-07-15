import { useEffect, useRef, useState } from "react";
import { Heart, LayoutGrid, Search, MessageCircle, Bell, Star, ChevronDown, UserCog, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Discover", href: "/browse", icon: Search },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Messages", href: "/messages", icon: MessageCircle },
];

export default function AppNavbar({ notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName || "Guest";
  const avatar =
    user?.googlePicture ||
    user?.photos?.[0]?.url ||
    `https://ui-avatars.com/api/?background=241717&color=e15a63&name=${encodeURIComponent(firstName)}`;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="border-b border-border/60 bg-ink">
      <div className="wrap flex items-center justify-between py-4">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white">
              <Heart size={18} fill="currentColor" />
            </span>
            <span className="font-display text-xl font-semibold tracking-wide">
              Humsafar
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.label}
                to={l.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-surface-2 text-rose"
                      : "text-muted hover:text-cream"
                  }`
                }
              >
                <l.icon size={16} />
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative text-muted hover:text-cream" aria-label="Notifications">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2"
            >
              <img src={avatar} alt={firstName} className="h-9 w-9 rounded-full object-cover" />
              <span className="text-sm font-medium">{firstName}</span>
              <ChevronDown size={14} className={`text-muted transition ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-border/60 bg-surface shadow-xl">
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-cream hover:bg-surface-2"
                >
                  <UserCog size={16} /> Edit profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-rose hover:bg-surface-2"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
