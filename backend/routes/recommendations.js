import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import WatchlistItem from '../models/WatchlistItem.js';
import protect from '../middleware/auth.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const IMDB = 'https://api.imdbapi.dev';

router.get('/', protect, async (req, res) => {
  try {
    const watchlist = await WatchlistItem.find({ userId: req.user._id }).limit(50);
    if (watchlist.length === 0) return res.json({ recommendations: [], empty: true });

    const summary = watchlist.map(w => ({
      title: w.primaryTitle, type: w.type, year: w.startYear,
      genres: w.genres, rating: w.rating?.aggregateRating,
      isFavourite: w.isFavourite, status: w.status,
    }));

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a world-class film and TV recommendation engine. Based on the user's watchlist, recommend exactly 3 titles they would genuinely love that are NOT already in their list.

Return ONLY a valid JSON array — no markdown, no preamble:
[
  { "title": "Exact Title", "year": 2023, "reason": "One compelling sentence grounded in their specific taste" },
  { "title": "...", "year": ..., "reason": "..." },
  { "title": "...", "year": ..., "reason": "..." }
]

User's watchlist:
${JSON.stringify(summary, null, 2)}`,
      }],
    });

    let recs = [];
    try {
      const raw = message.content[0].text.replace(/```json|```/g, '').trim();
      recs = JSON.parse(raw);
    } catch {
      return res.status(500).json({ message: 'Failed to parse AI response. Try again.' });
    }

    const enriched = await Promise.all(recs.map(async (rec) => {
      try {
        const { data } = await axios.get(`${IMDB}/search/titles`, {
          params: { query: `${rec.title} ${rec.year}`, limit: 1 },
        });
        return { ...rec, imdbData: data.titles?.[0] || null };
      } catch {
        return { ...rec, imdbData: null };
      }
    }));

    res.json({ recommendations: enriched });
  } catch (err) {
    console.error('Recommendations error:', err);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

export default router;
