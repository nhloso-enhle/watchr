import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes            from './routes/auth.js';
import watchlistRoutes       from './routes/watchlist.js';
import titlesRoutes          from './routes/titles.js';
import recommendationsRoutes from './routes/recommendations.js';
import publicRoutes          from './routes/public.js';

await connectDB();

const app = express();

app.use(cors({
  origin: "https://watchr-r9t3o1h7b-nhloso-khumalos-projects.vercel.app",
  credentials: true
}));
app.use(express.json());

// Public — no auth required (carousel images for login/register pages)
app.use('/api/public', publicRoutes);

// Protected API routes
app.use('/api/auth',            authRoutes);
app.use('/api/watchlist',       watchlistRoutes);
app.use('/api/titles',          titlesRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🎬  watchr. API running on :${PORT}`));
