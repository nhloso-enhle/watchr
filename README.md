# watchr.

A sleek, modern personal watchlist app — light/dark mode, AI recommendations, and IMDb search.

## What's new in v2

- **Full redesign** — Roboto font, blue accent, clean Next.js-inspired UI
- **Light & dark mode** — toggleable, respects system preference, no flash on load
- **Animations** — page entrance, card stagger, skeleton shimmer, modal slide-in
- **Title detail modal** — click any title name in Explore to see full cast, plot, rating
- **Forgot password** — 2-step reset flow (email → 6-digit code → new password)
- **Watchlist is now the home page** — Explore reachable via "Find more titles" button
- **Watchlist badge removed** from nav (count visible on the Watchlist page itself)

## Quick start

```bash
# 1 — Frontend
npm install && npm run dev

# 2 — Backend (new terminal)
cd backend && npm install

# 3 — Environment
cp backend/.env.example backend/.env
# Fill in: MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY

# 4 — Start backend
cd backend && npm run dev
```

## Forgot password (dev mode)

There is no email service configured. When a reset is requested, the 6-digit code is:
- Logged to the **backend console**
- Returned in the API response as `devCode` (displayed in the UI with a yellow banner)

To wire up a real email provider, replace the `console.log` in `backend/routes/auth.js`
`/forgot-password` with your email-sending logic (nodemailer, Resend, SendGrid, etc.).
The reset token flow itself is production-ready.

## File structure (changes from v1)

```
src/
  context/ThemeContext.jsx   ← NEW  — light/dark toggle
  components/TitleModal.jsx  ← NEW  — detail modal
  pages/ForgotPassword.jsx   ← NEW  — 2-step password reset
  index.css                  ← full redesign (CSS vars, animations)
  App.jsx                    ← watchlist as default route, /forgot-password added
  components/Navbar.jsx      ← no badge, theme toggle, Roboto
  pages/Watchlist.jsx        ← "Find more titles" button, default landing
  pages/Explore.jsx          ← title name opens modal

backend/
  models/User.js             ← resetCode + resetCodeExpiry fields
  routes/auth.js             ← /forgot-password + /reset-password endpoints
```
