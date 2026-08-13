# 🎬 Watchr

A full-stack personal watchlist app powered by IMDb data and Claude AI.

---

## Features

- **Explore** — Search IMDb's full database with debounced live search
- **Watchlist** — Save titles with status tracking (Want to Watch / Watching / Completed), sort and filter
- **Favourites** — Heart any title to mark it as a favourite
- **Spotlight** — Titles you saved *before* release automatically appear here for 2 weeks after they drop
- **For You** — Claude AI analyses your watchlist and generates 3 personalised recommendations
- **Auth** — JWT-based register/login with persistent sessions

---

## Tech Stack

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| Frontend  | React 19, Vite, TailwindCSS v4, React Router  |
| Backend   | Node.js, Express, MongoDB + Mongoose          |
| Auth      | JWT (jsonwebtoken + bcryptjs)                 |
| AI        | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Data      | IMDb API via `api.imdbapi.dev`                |

---

## Project Structure

```
watchr/
├── backend/                  ← Express API
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── WatchlistItem.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── watchlist.js
│   │   ├── titles.js
│   │   └── recommendations.js
│   ├── server.js
│   └── package.json
└── src/                      ← React frontend
    ├── api/client.js
    ├── context/
    │   ├── AuthContext.jsx
    │   └── WatchlistContext.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── Navbar.jsx
    │   ├── TitleCard.jsx
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Explore.jsx
        ├── Watchlist.jsx
        ├── Spotlight.jsx
        └── Recommendations.jsx
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure backend environment
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/watchr
JWT_SECRET=your_long_random_secret_here_minimum_32_chars
ANTHROPIC_API_KEY=sk-ant-api03-...
CLIENT_URL=http://localhost:5173
```

### 4. Run both servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000

The Vite proxy forwards all `/api` requests to the backend automatically — no CORS issues.

---

## How Spotlight Works

When you add a title whose `startYear` is greater than the current year, it's flagged as `wasUpcoming = true`. Every time your watchlist is fetched, the backend checks if any upcoming titles now have `startYear <= currentYear` and stamps them with `releasedAt = now`. The Spotlight page then shows titles where `releasedAt` is within the last **14 days**.

---

## Environment Variables Reference

| Variable           | Description                                    |
|--------------------|------------------------------------------------|
| `MONGODB_URI`      | MongoDB connection string                      |
| `JWT_SECRET`       | Secret for signing JWTs (keep this private)    |
| `ANTHROPIC_API_KEY`| From https://console.anthropic.com             |
| `CLIENT_URL`       | Frontend origin for CORS (default: localhost)  |
| `PORT`             | Backend port (default: 5000)                   |
