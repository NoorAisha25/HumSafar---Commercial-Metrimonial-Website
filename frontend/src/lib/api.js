const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("humsafar_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function uploadRequest(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { ...authHeaders() }, // no Content-Type — browser sets the multipart boundary
    body: formData,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Upload failed");
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  googleAuth: (credential) => request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  me: () => request("/auth/me"),
  myProfile: () => request("/profile"),
  getProfile: (id) => request(`/profile/${id}`),
  updateProfile: (payload) => request("/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  uploadProfilePhoto: (file) => {
    const form = new FormData();
    form.append("photo", file);
    return uploadRequest("/profile/photo", form);
  },
  discover: (params) => request(`/discover?${new URLSearchParams(params)}`),
  featured: () => request("/discover/featured"),
  sendInterest: (to) => request("/interests", { method: "POST", body: JSON.stringify({ to }) }),
  receivedInterests: () => request("/interests/received"),
  sentInterests: () => request("/interests/sent"),
  respondInterest: (id, status) =>
    request(`/interests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  favorites: () => request("/favorites"),
  addFavorite: (profile) => request("/favorites", { method: "POST", body: JSON.stringify({ profile }) }),
  removeFavorite: (profileId) => request(`/favorites/${profileId}`, { method: "DELETE" }),
  matches: () => request("/interests/matches"),
  messageHistory: (otherUserId) => request(`/messages/${otherUserId}`),
  stats: () => request("/stats"),
};
