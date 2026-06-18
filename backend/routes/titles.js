import express from 'express';
import axios from 'axios';
import protect from '../middleware/auth.js';

const router = express.Router();
const IMDB = 'https://api.imdbapi.dev';

async function imdbGet(url, params, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const { data } = await axios.get(url, { params, timeout: 10000 });
      return data;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

router.get('/search', protect, async (req, res) => {
  try {
    const { query, limit = 60 } = req.query;
    if (!query?.trim()) return res.json([]);
    const data = await imdbGet(`${IMDB}/search/titles`, { query, limit });
    res.json(data.titles || []);
  } catch {
    res.status(502).json({ message: 'IMDb API unavailable. Please try again.' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const data = await imdbGet(`${IMDB}/titles/${req.params.id}`, {});
    res.json(data);
  } catch {
    res.status(502).json({ message: 'IMDb API unavailable. Please try again.' });
  }
});

export default router;