import express from 'express';
import axios from 'axios';
import WatchlistItem from '../models/WatchlistItem.js';
import protect from '../middleware/auth.js';

const router = express.Router();
const IMDB = 'https://api.imdbapi.dev';

/* Silently back-fills descriptions for items that are missing one.
   Runs after the response is sent — processes up to 5 items per fetch
   to avoid hammering the IMDb API. Next fetch catches more. */
async function patchMissingDescriptions(items) {
  const missing = items.filter(i => !i.description && !i.plot).slice(0, 5);
  for (const item of missing) {
    try {
      const { data } = await axios.get(`${IMDB}/titles/${item.titleId}`, { timeout: 6000 });
      const desc = data?.plot || data?.description || '';
      if (desc) {
        await WatchlistItem.findByIdAndUpdate(item._id, { description: desc });
      }
      // Small delay between requests to avoid rate-limiting
      await new Promise(r => setTimeout(r, 250));
    } catch { /* silent — will retry next fetch */ }
  }
}

/* ── GET /spotlight — MUST be before /:titleId ───────────────── */
router.get('/spotlight', protect, async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const items = await WatchlistItem.find({
      userId: req.user._id,
      wasUpcoming: true,
      releasedAt: { $gte: cutoff },
    }).sort({ releasedAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── GET / — full watchlist with spotlight detection ─────────── */
router.get('/', protect, async (req, res) => {
  try {
    const { status, sort, type, favourite } = req.query;
    const query = { userId: req.user._id };
    if (status)           query.status     = status;
    if (type)             query.type       = type;
    if (favourite === 'true') query.isFavourite = true;

    const sortMap = {
      title:  { primaryTitle: 1 },
      rating: { 'rating.aggregateRating': -1 },
      year:   { startYear: -1 },
      added:  { createdAt: -1 },
    };
    const items = await WatchlistItem.find(query).sort(sortMap[sort] || sortMap.added);

    // Detect newly-released upcoming titles
    const currentYear = new Date().getFullYear();
    await Promise.all(
      items
        .filter(i => i.wasUpcoming && i.startYear <= currentYear && !i.releasedAt)
        .map(i => { i.releasedAt = new Date(); return i.save(); })
    );

    // Send response immediately, then patch missing descriptions in background
    res.json(items);
    patchMissingDescriptions(items).catch(() => {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── POST / — add item ───────────────────────────────────────── */
router.post('/', protect, async (req, res) => {
  try {
    const {
      titleId, primaryTitle, originalTitle, type, startYear,
      primaryImage, rating, genres, plot, description,
    } = req.body;

    const exists = await WatchlistItem.findOne({ userId: req.user._id, titleId });
    if (exists) return res.status(400).json({ message: 'Already in watchlist' });

    const wasUpcoming = startYear != null && startYear > new Date().getFullYear();
    const item = await WatchlistItem.create({
      userId: req.user._id, titleId, primaryTitle, originalTitle,
      type, startYear, primaryImage, rating, genres,
      plot, description: description || plot || '',
      wasUpcoming,
    });
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── PATCH /:titleId ─────────────────────────────────────────── */
router.patch('/:titleId', protect, async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({ userId: req.user._id, titleId: req.params.titleId });
    if (!item) return res.status(404).json({ message: 'Not found' });
    const { status, isFavourite } = req.body;
    if (status      !== undefined) item.status      = status;
    if (isFavourite !== undefined) item.isFavourite = isFavourite;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ── DELETE /:titleId ────────────────────────────────────────── */
router.delete('/:titleId', protect, async (req, res) => {
  try {
    await WatchlistItem.findOneAndDelete({ userId: req.user._id, titleId: req.params.titleId });
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
