import express from 'express';
import Groq from 'groq-sdk';
import axios from 'axios';
import WatchlistItem from '../models/WatchlistItem.js';
import protect from '../middleware/auth.js';

const router = express.Router();
const groq   = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TMDB = 'https://api.themoviedb.org/3';
const IMG  = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: TMDB,
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
  timeout: 8000,
});

async function enrichWithTMDB(title, year) {
  try {
    const { data } = await tmdb.get('/search/multi', {
      params: { query: `${title} ${year || ''}`.trim(), include_adult: false, page: 1 },
    });
    const hit = (data.results || []).find(r => r.media_type === 'movie' || r.media_type === 'tv');
    if (!hit) return null;

    const isTV  = hit.media_type === 'tv';
    const poster = hit.poster_path ? `${IMG}/w500${hit.poster_path}` : null;
    return {
      id:           `${hit.media_type}-${hit.id}`,
      tmdbId:       hit.id,
      mediaType:    hit.media_type,
      primaryTitle: hit.title || hit.name,
      startYear:    parseInt((hit.release_date || hit.first_air_date || '').split('-')[0]) || year,
      primaryImage: poster ? { url: poster } : null,
      rating: hit.vote_average ? {
        aggregateRating: Math.round(hit.vote_average * 10) / 10,
        voteCount: hit.vote_count,
      } : null,
      plot: hit.overview || '',
    };
  } catch { return null; }
}

router.get('/', protect, async (req, res) => {
  try {
    const watchlist = await WatchlistItem.find({ userId: req.user._id }).limit(50);
    if (watchlist.length === 0) return res.json({ recommendations: [], empty: true });

    const summary = watchlist.map(w => ({
      title:       w.primaryTitle,
      type:        w.type,
      year:        w.startYear,
      genres:      w.genres,
      rating:      w.rating?.aggregateRating,
      isFavourite: w.isFavourite,
      status:      w.status,
    }));

    const completion = await groq.chat.completions.create({
      model:      'llama-3.3-70b-versatile',
      max_tokens: 600,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: `You are a world-class film and TV recommendation engine. Based on the user's watchlist below, recommend exactly 3 titles they would genuinely love that are NOT already in their list. Favour titles with depth, critical acclaim, or cult status that match their demonstrated taste.

Return ONLY a valid JSON array — no markdown, no preamble, no explanation:
[
  { "title": "Exact Title", "year": 2023, "reason": "One compelling sentence grounded in their specific taste" },
  { "title": "...", "year": ..., "reason": "..." },
  { "title": "...", "year": ..., "reason": "..." }
]

User watchlist:
${JSON.stringify(summary, null, 2)}`,
      }],
    });

    let recs = [];
    try {
      const raw = completion.choices[0]?.message?.content?.replace(/```json|```/g, '').trim();
      recs = JSON.parse(raw);
    } catch {
      return res.status(500).json({ message: 'Failed to parse AI response. Try again.' });
    }

    // Enrich with TMDB data in parallel
    const enriched = await Promise.all(
      recs.map(async rec => ({
        ...rec,
        imdbData: await enrichWithTMDB(rec.title, rec.year),
      }))
    );

    res.json({ recommendations: enriched });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ message: 'Failed to generate recommendations. Try again.' });
  }
});

export default router;
