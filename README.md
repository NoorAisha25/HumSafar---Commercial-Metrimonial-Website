# Humsafar — Matrimonial Platform

A full MERN matrimonial platform: dark maroon theme, serif display headings,
verified-profile matrimonial flow — fully wired to a real backend, with
real-time chat and Google Sign-In.

```
humsafar/
├── frontend/   React + Vite + Tailwind v4
└── backend/    Node + Express + MongoDB + Socket.io + Cloudinary + JWT
```


### 1. Backend (required now — the frontend has no working mock mode)

```bash
cd backend
cp .env
npm install
npm run dev   # http://localhost:5000, needs MongoDB running
```

### 2. Frontend

```bash
cd frontend
cp .env
npm install
npm run dev   # http://localhost:5173
```

## Full endpoint reference

| Feature | Route(s) |
|---|---|
| Register / Login (JWT) | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Google Sign-In | `POST /api/auth/google` |
| Profile + Cloudinary photo upload | `GET /api/profile` (own), `GET /api/profile/:id` (any), `PATCH /api/profile`, `POST /api/profile/photo` |
| Discover / search with match % | `GET /api/discover` (auth), `GET /api/discover/featured` (public) |
| Send / accept / decline interest | `POST /api/interests`, `PATCH /api/interests/:id`, `GET /api/interests/received`, `GET /api/interests/sent`, `GET /api/interests/matches` |
| Favorites | `GET/POST/DELETE /api/favorites` |
| Real-time chat + presence | Socket.io events `message:send`, `message:new`, `typing` |
| Message history | `GET /api/messages/:otherUserId` |
| Live counters | `GET /api/stats` (public) |

One MongoDB database, multiple collections (`users`, `interests`,
`favorites`, `messages`, `events`) — no microservices split

## Design notes

- Fonts: Playfair Display (headings) + Inter (body), loaded via Google Fonts in `index.html`.
- Theme tokens live in `frontend/src/index.css` under `@theme` — tweak `--color-rose`, `--color-ink`, etc. to adjust the palette everywhere at once.
- The shared `.wrap` class (also in `index.css`) controls page width/margins — change it once to adjust every page.
- Photos in the seed/example data are placeholder Unsplash images; real member photos come from Cloudinary once someone uploads one.
