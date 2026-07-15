import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "humsafar_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function register(profile) {
    const { token, user: newUser } = await api.register(profile);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(newUser);
    return newUser;
  }

  async function login(email, password) {
    const { token, user: loggedInUser } = await api.login({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function loginWithGoogle(credential) {
    const { token, user: googleUser } = await api.googleAuth(credential);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(googleUser);
    return googleUser;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  async function refreshUser() {
    const fresh = await api.me();
    setUser(fresh);
    return fresh;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
