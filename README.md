# Humsafar — Matrimonial Platform

A full MERN matrimonial platform: dark maroon theme, serif display headings,
verified-profile matrimonial flow — fully wired to a real backend, with
real-time chat and Google Sign-In.

```
humsafar/
├── frontend/   React + Vite + Tailwind v4
└── backend/    Node + Express + MongoDB + Socket.io + Cloudinary + JWT
```

## Latest fixes

- **Duplicate messages fixed.** The sender used to see their own message
  twice ("hi hi") because it was appended both from the send acknowledgment
  *and* the real-time broadcast the server also sends back to the sender's
  own room. Now it's only appended once, from the broadcast — same as the
  recipient.
- **Edit profile page.** Click your avatar in the top-right → **Edit
  profile** (or go to `/settings`) to update anything from registration —
  name, gender, DOB, religion, mother tongue, location, education,
  profession, bio, and partner preferences — plus upload/replace your
  profile photo (goes straight to Cloudinary).
- **"View" now opens a real profile page.** Every "View" button across
  Discover, Dashboard, and Favorites goes to `/profile/:id` with the full
  profile — photo, details, Send Interest, and Save to Favorites.
- **Membership nav link fixed.** "How It Works" / "Success Stories" /
  "Membership" now reliably scroll to their section, whether you're already
  on the landing page or clicking from somewhere else (it navigates home
  first, then scrolls).
- **Auth-gated pages.** Dashboard, Discover, Favorites, Messages, and
  Settings now redirect to `/login` if you're not signed in, instead of
  silently showing empty states.

## What changed in the previous round

- **No more fake profiles.** Dashboard, Discover, Favorites and the landing
  page's "Featured members" all call the real `/api/discover`, `/api/interests`,
  `/api/favorites` endpoints. If your database is empty, you'll see an honest
  empty state ("Be our first member") instead of invented people.
- **No more fake stats.** The hero counters call `GET /api/stats` and show
  your actual member/match counts — starts at 0 on a fresh database, and
  grows as real people sign up.
- **Real-time chat.** `Messages.jsx` connects to the backend over Socket.io
  (`socket.io-client`), loads real message history, and sends/receives
  messages live. Chat is only available between two users who've mutually
  accepted each other's interest (`GET /api/interests/matches`).
- **Real auth.** `AuthContext` calls `POST /api/auth/register` and
  `POST /api/auth/login` for real — no more localStorage-only fake login.
- **Google Sign-In.** Both Register and Login pages now have a real "Continue
  with Google" button (Google Identity Services), verified server-side.
- **Logo always goes home.** Clicking "Humsafar" in the app header now
  navigates to `/` instead of just reloading the dashboard.
- **Wider layout.** Replaced the old `max-w-7xl`/`px-6` container with a
  shared `.wrap` utility (`max-w-[1520px]`, smaller side gutters) matching
  the original v0 design's proportions more closely.

## Quick start

### 1. Backend (required now — the frontend has no working mock mode)

```bash
cd backend
cp .env.example .env
npm install
npm run dev   # http://localhost:5000, needs MongoDB running
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev   # http://localhost:5173
```

Since the frontend now calls the real API for everything, you need the
backend running (and a MongoDB connection) to see any data — this is
intentional, per your request to make this a real project rather than a demo.

## Setting up Google Sign-In

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** → Application type: **Web application**
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (dev)
   - your real domain once deployed
4. Copy the generated **Client ID** (looks like `123...apps.googleusercontent.com`)
5. Set it in **both**:
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`

You don't need a Client Secret for this flow — the frontend gets a signed ID
token from Google, and the backend verifies it server-side with
`google-auth-library` before trusting it (see `backend/src/routes/auth.routes.js`,
`POST /api/auth/google`).

A Google sign-up creates an account with just name + email (Google already
verifies the email, so `isVerified` is set true immediately). Since Google
doesn't hand over gender/religion/city/etc., those fields stay optional on
the `User` model until the person fills in steps 2–3 of registration
themselves — check `user.profileComplete` (a virtual on the model) to prompt
them to finish their profile before they show up in Discover.

## How real-time chat works

- `backend/src/sockets/chat.socket.js` authenticates each socket connection
  with the same JWT used for REST calls, then listens for `message:send` and
  broadcasts `message:new` to both participants' personal rooms.
- `frontend/src/context/SocketContext.jsx` opens one socket connection per
  logged-in session and exposes it via `useSocket()`.
- `Messages.jsx` only lets you chat with **mutual matches** — people whose
  interest you've accepted or who've accepted yours (`GET /api/interests/matches`).
  This mirrors how real matrimonial platforms gate messaging behind mutual
  consent instead of open DMs.

## Full endpoint reference

| Feature | Route(s) |
|---|---|
| Register / Login (JWT) | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Google Sign-In | `POST /api/auth/google` |
| Email OTP verification | `POST /api/auth/send-otp`, `POST /api/auth/verify-otp` |
| Profile + Cloudinary photo upload | `GET /api/profile` (own), `GET /api/profile/:id` (any), `PATCH /api/profile`, `POST /api/profile/photo` |
| Discover / search with match % | `GET /api/discover` (auth), `GET /api/discover/featured` (public) |
| Send / accept / decline interest | `POST /api/interests`, `PATCH /api/interests/:id`, `GET /api/interests/received`, `GET /api/interests/sent`, `GET /api/interests/matches` |
| Favorites | `GET/POST/DELETE /api/favorites` |
| Real-time chat + presence | Socket.io events `message:send`, `message:new`, `typing` |
| Message history | `GET /api/messages/:otherUserId` |
| Live counters | `GET /api/stats` (public) |

One MongoDB database, multiple collections (`users`, `interests`,
`favorites`, `messages`, `events`) — no microservices split, matching the
"minimum viable stack" you originally specced out.

## Design notes

- Fonts: Playfair Display (headings) + Inter (body), loaded via Google Fonts in `index.html`.
- Theme tokens live in `frontend/src/index.css` under `@theme` — tweak `--color-rose`, `--color-ink`, etc. to adjust the palette everywhere at once.
- The shared `.wrap` class (also in `index.css`) controls page width/margins — change it once to adjust every page.
- Photos in the seed/example data are placeholder Unsplash images; real member photos come from Cloudinary once someone uploads one.
