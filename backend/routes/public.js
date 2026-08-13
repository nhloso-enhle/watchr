import express from 'express';
import axios from 'axios';

const router  = express.Router();
const IMG     = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
  timeout: 8000,
});

router.get('/carousel', async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/all/week', { params: { language: 'en-US' } });
    const posters = (data.results || [])
      .filter(r => r.poster_path)
      .map(r => `${IMG}/w342${r.poster_path}`)
      .slice(0, 20);
    res.json(posters);
  } catch {
    res.json([]); // fail silently — carousel is decorative
  }
});

export default router;
