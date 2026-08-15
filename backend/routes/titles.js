import express from 'express';
import axios from 'axios';
import protect from '../middleware/auth.js';

const router = express.Router();
const TMDB = 'https://api.themoviedb.org/3';
const IMG  = 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
  baseURL: TMDB,
  headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  timeout: 10000,
});

async function tmdbGet(path, params = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const { data } = await tmdb.get(path, { params });
      return data;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
}

const GENRE_MAP = {
  28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
  99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
  27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Science Fiction',
  10770:'TV Movie',53:'Thriller',10752:'War',37:'Western',
  10759:'Action & Adventure',10762:'Kids',10763:'News',10764:'Reality',
  10765:'Sci-Fi & Fantasy',10766:'Soap',10767:'Talk',10768:'War & Politics',
};

function normalise(item) {
  const isTV     = item.media_type === 'tv' || !!item.first_air_date;
  const title    = item.title || item.name || '';
  const origTitle= item.original_title || item.original_name || title;
  const year     = parseInt((item.release_date || item.first_air_date || '').split('-')[0]) || null;
  const poster   = item.poster_path   ? `${IMG}/w500${item.poster_path}`   : null;
  const backdrop = item.backdrop_path ? `${IMG}/w1280${item.backdrop_path}` : null;
  return {
    id:            `${item.media_type || (isTV ? 'tv' : 'movie')}-${item.id}`,
    tmdbId:        item.id,
    mediaType:     item.media_type || (isTV ? 'tv' : 'movie'),
    type:          isTV ? 'tvSeries' : 'movie',
    primaryTitle:  title,
    originalTitle: origTitle,
    startYear:     year,
    primaryImage:  poster   ? { url: poster }   : null,
    backdrop:      backdrop ? { url: backdrop }  : null,
    rating: item.vote_average
      ? { aggregateRating: Math.round(item.vote_average * 10) / 10, voteCount: item.vote_count || 0 }
      : null,
    plot:   item.overview || '',
    genres: (item.genres || []).map(g => g.name).concat(
      (item.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean)
    ).filter((v, i, a) => a.indexOf(v) === i),
    adult: item.adult || false,
  };
}

/* ── Search ─────────────────────────────────────────────────── */
router.get('/search', protect, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    if (!query?.trim()) return res.json([]);
    const data = await tmdbGet('/search/multi', { query, include_adult: false, language: 'en-US', page: 1 });
    const results = (data.results || [])
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, parseInt(limit))
      .map(normalise);
    res.json(results);
  } catch (err) {
    console.error('TMDB search error:', err.message);
    res.status(502).json({ message: 'TMDB unavailable. Please try again.' });
  }
});

/* ── Trending ───────────────────────────────────────────────── */
router.get('/trending', protect, async (req, res) => {
  try {
    const data = await tmdbGet('/trending/all/week', { language: 'en-US' });
    const results = (data.results || [])
      .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 20)
      .map(normalise);
    res.json(results);
  } catch {
    res.status(502).json({ message: 'TMDB unavailable.' });
  }
});

/* ── Detail — id format: "movie-550" or "tv-1399" ───────────── */
router.get('/:id', protect, async (req, res) => {
  try {
    const parts = req.params.id.split('-');
    const mediaType = parts[0];
    const tmdbId    = parts.slice(1).join('-');
    if (!mediaType || !tmdbId) return res.status(400).json({ message: 'Invalid ID. Use movie-{id} or tv-{id}' });

    const endpoint = mediaType === 'tv' ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
    const data = await tmdbGet(endpoint, { language: 'en-US', append_to_response: 'credits,videos' });
    const base = normalise({ ...data, media_type: mediaType });

    const credits    = data.credits || {};
    const directors  = mediaType === 'movie'
      ? (credits.crew || []).filter(c => c.job === 'Director').map(c => ({ id: c.id, displayName: c.name }))
      : (data.created_by || []).map(c => ({ id: c.id, displayName: c.name }));
    const stars      = (credits.cast || []).slice(0, 6).map(c => ({ id: c.id, displayName: c.name, character: c.character }));
    const runtime    = data.runtime || data.episode_run_time?.[0] || null;
    const trailer    = (data.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key || null;

    res.json({
      ...base,
      genres:         (data.genres || []).map(g => g.name),
      directors,
      stars,
      runtimeSeconds: runtime ? runtime * 60 : null,
      seasons:        data.number_of_seasons  || null,
      episodes:       data.number_of_episodes || null,
      status:         data.status             || null,
      tagline:        data.tagline            || null,
      trailer,
    });
  } catch (err) {
    console.error('TMDB detail error:', err.message);
    res.status(502).json({ message: 'TMDB unavailable. Please try again.' });
  }
});

export default router;
