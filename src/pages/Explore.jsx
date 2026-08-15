import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, TrendingUp, Film, Tv2 } from 'lucide-react';
import client from '../api/client';
import TitleCard  from '../components/TitleCard';
import TitleModal from '../components/TitleModal';
import Pagination from '../components/Pagination';

const PER_PAGE = 12;

function SkeletonItem() {
  return (
    <div className="card flex items-center gap-3 p-2.5" style={{ borderRadius: '12px' }}>
      <div className="skeleton flex-shrink-0 rounded-lg" style={{ width: 52, height: 78 }} />
      <div className="flex-1 space-y-2"><div className="skeleton h-3 w-3/5" /><div className="skeleton h-2.5 w-2/5" /><div className="skeleton h-2.5 w-1/4" /></div>
      <div className="skeleton flex-shrink-0 rounded-lg" style={{ height: 32, width: 64 }} />
    </div>
  );
}

export default function Explore() {
  const [query,     setQuery]     = useState('');
  const [results,   setResults]   = useState([]);
  const [trending,  setTrending]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [trendLoad, setTrendLoad] = useState(true);
  const [searched,  setSearched]  = useState(false);
  const [modalId,   setModalId]   = useState(null);
  const [page,      setPage]      = useState(1);
  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  useEffect(() => {
    client.get('/titles/trending')
      .then(({ data }) => setTrending(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setTrendLoad(false));
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); setLoading(false); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setSearched(true); setPage(1);
    try {
      const { data } = await client.get('/titles/search', { params: { query: q, limit: 60 }, signal: abortRef.current.signal });
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setResults([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 700);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const paged      = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const handlePage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen page" style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-10 sm:py-12 px-4 sm:px-6" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.1), transparent 65%)' }} />
        <div className="relative max-w-xl mx-auto text-center">
          <h1 className="font-bold mb-2" style={{ fontSize: 'clamp(1.5rem, 5vw, 1.85rem)', color: 'var(--text)', letterSpacing: '-0.02em' }}>Discover Your Next Watch</h1>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-2)' }}>Powered by TMDB — millions of movies and TV shows</p>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-3)' }} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search movies, series, shows…" autoFocus className="field" style={{ paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '1rem' }} />
            {query && <button onClick={() => { setQuery(''); setSearched(false); setResults([]); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'var(--border)', color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {loading && <div className="flex flex-col gap-2 mt-6">{Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)}</div>}

        {!loading && searched && results.length === 0 && <div className="text-center py-20"><p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>No results for "{query}"</p><p className="text-sm" style={{ color: 'var(--text-3)' }}>Try a different search term</p></div>}

        {!loading && paged.length > 0 && searched && (
          <>
            <p className="py-4 text-sm" style={{ color: 'var(--text-3)' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, results.length)} of <span style={{ color: 'var(--text)', fontWeight: 500 }}>{results.length}</span> results ·{' '}
              <span style={{ color: 'var(--accent)' }}>click a title name for details</span>
            </p>
            <div className="flex flex-col gap-2">{paged.map((t, i) => <TitleCard key={t.id} title={t} mode="explore" animDelay={i * 25} onTitleClick={id => setModalId(id)} />)}</div>
            <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
          </>
        )}

        {!searched && !loading && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Trending This Week</h2>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>· via TMDB</span>
            </div>
            {trendLoad
              ? <div className="flex flex-col gap-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)}</div>
              : trending.length > 0
                ? <div className="flex flex-col gap-2">{trending.slice(0, PER_PAGE).map((t, i) => <TitleCard key={t.id} title={t} mode="explore" animDelay={i * 30} onTitleClick={id => setModalId(id)} />)}</div>
                : <div className="flex flex-col items-center py-16 text-center"><div className="flex gap-6 mb-5 opacity-15"><Film size={36} style={{ color: 'var(--accent)' }} /><Tv2 size={36} style={{ color: 'var(--text-3)' }} /></div><p className="font-medium" style={{ color: 'var(--text-2)' }}>Search above to find titles</p></div>}
          </div>
        )}
      </div>
      {modalId && <TitleModal titleId={modalId} onClose={() => setModalId(null)} />}
    </div>
  );
}
