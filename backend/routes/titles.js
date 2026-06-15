import express from 'express';
import axios from 'axios';
import protect from '../middleware/auth.js';

const router = express.Router();
const IMDB = 'https://api.imdbapi.dev';

router.get('/search', protect, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    if (!query?.trim()) return res.json([]);
    const { data } = await axios.get(`${IMDB}/search/titles`, { params: { query, limit } });
    res.json(data.titles || []);
  } catch {
    res.status(502).json({ message: 'IMDb API unavailable' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${IMDB}/titles/${req.params.id}`);
    res.json(data);
  } catch {
    res.status(502).json({ message: 'IMDb API unavailable' });
  }
});

export default router;
