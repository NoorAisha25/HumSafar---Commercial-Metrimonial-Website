import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import EditProfile from "./pages/EditProfile";
import ProfileDetail from "./pages/ProfileDetail";
import { useAuth } from "./context/AuthContext";

// Path prefixes that render their own full-bleed layout (no public navbar/footer chrome)
const BARE_PREFIXES = ["/register", "/login", "/dashboard", "/browse", "/favorites", "/messages", "/settings", "/profile"];

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isBare = BARE_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-ink text-cream">
      {!isBare && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<ProfileDetail />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/browse"
          element={
            <RequireAuth>
              <Discover />
            </RequireAuth>
          }
        />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <Favorites />
            </RequireAuth>
          }
        />
        <Route
          path="/messages"
          element={
            <RequireAuth>
              <Messages />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />
      </Routes>
      {!isBare && <Footer />}
    </div>
  );
}
