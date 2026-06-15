import express from 'express';
import axios from 'axios';

const router = express.Router();
const IMDB = 'https://api.imdbapi.dev';

// Rotate through a few queries so we get variety each visit
const QUERIES = [
  'action thriller 2024',
  'drama 2024',
  'sci-fi adventure 2023',
  'crime mystery 2024',
  'horror 2024',
];

router.get('/carousel', async (req, res) => {
  try {
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const { data } = await axios.get(`${IMDB}/search/titles`, {
      params: { query, limit: 20 },
      timeout: 8000,
    });
    const posters = (data.titles || [])
      .filter(t => t.primaryImage?.url)
      .map(t => t.primaryImage.url)
      .slice(0, 18);
    res.json(posters);
  } catch {
    res.json([]); // fail silently — carousel is decorative
  }
});

export default router;
