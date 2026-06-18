import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes            from './routes/auth.js';
import watchlistRoutes       from './routes/watchlist.js';
import titlesRoutes          from './routes/titles.js';
import recommendationsRoutes from './routes/recommendations.js';
import publicRoutes          from './routes/public.js';
import profileRoutes         from './routes/profile.js';

await connectDB();

const app = express();

// Allow requests from the Vercel frontend and local dev.
// In production CLIENT_URL=https://watchrbynhloso.vercel.app (set in Render dashboard).
app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||                                              // server-to-server / Postman
      origin === 'https://watchrbynhloso.vercel.app' ||      // production domain
      origin === 'http://localhost:5173' ||                   // local dev
      /^https:\/\/watchr.*\.vercel\.app$/.test(origin)       // any Vercel preview URL
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Public — no auth needed (carousel images for login/register pages)
app.use('/api/public', publicRoutes);

// Protected API
app.use('/api/profile', profileRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/watchlist',       watchlistRoutes);
app.use('/api/titles',          titlesRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎬  watchr. API running on :${PORT}`));
