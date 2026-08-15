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

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origin === 'https://watchrbynhloso.vercel.app' ||
      origin === 'http://localhost:5173' ||
      /^https:\/\/watchr.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use('/api/public',          publicRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/watchlist',       watchlistRoutes);
app.use('/api/titles',          titlesRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/profile',         profileRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎬  watchr. API running on :${PORT}`));
