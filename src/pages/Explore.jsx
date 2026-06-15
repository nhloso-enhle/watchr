import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Film, Tv, Star } from 'lucide-react';
import client from '../api/client';
import TitleCard from '../components/TitleCard';
import TitleModal from '../components/TitleModal';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div className="p-3 space-y-2" style={{ background: 'var(--surface)' }}>
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-2/5" />
        <div className="skeleton h-8 w-full mt-2" />
      </div>
    </div>
  );
}

export default function Explore() {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [modalId, setModalId]     = useState(null);
  const debounce = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await client.get('/titles/search', { params: { query: q, limit: 20 } });
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(debounce.current);
  }, [query, doSearch]);

  return (
    <div className="min-h-screen page" style={{ background: 'var(--bg)' }}>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-6"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {/* Blue glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.1), transparent 65%)' }} />

        <div className="relative max-w-xl mx-auto text-center">
          <h1 className="font-bold mb-2" style={{ fontSize: '1.9rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Discover Your Next Watch
          </h1>
          <p className="mb-7 text-sm" style={{ color: 'var(--text-2)' }}>
            Search millions of titles from the IMDb database
          </p>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-3)' }} />
            {/* Use field class but override left padding */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, shows…"
              autoFocus
              className="field"
              style={{ paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '1rem', fontSize: '0.95rem' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
                style={{ background: 'var(--border)', color: 'var(--text-3)' }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 pb-16">

        {/* Empty / idle state */}
        {!searched && !loading && (
          <div className="flex flex-col items-center text-center py-24">
            <div className="flex gap-6 mb-6 opacity-15">
              <Film size={40} style={{ color: 'var(--accent)' }} />
              <Tv size={40} style={{ color: 'var(--text-3)' }} />
              <Star size={40} style={{ color: 'var(--gold)' }} />
            </div>
            <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text)' }}>
              What are you looking for?
            </p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Search above to find titles — click a title's name for details
            </p>
          </div>
        )}

        {/* Skeleton grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-24">
            <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text)' }}>No results for "{query}"</p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>Try a different search term</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <p className="py-5 text-sm" style={{ color: 'var(--text-3)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>"{query}"</span>
              <span className="ml-2" style={{ color: 'var(--accent)' }}>· click a title name for details</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((title, i) => (
                <TitleCard
                  key={title.id}
                  title={title}
                  mode="explore"
                  animDelay={i * 35}
                  onTitleClick={(id) => setModalId(id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Title detail modal */}
      {modalId && (
        <TitleModal titleId={modalId} onClose={() => setModalId(null)} />
      )}
    </div>
  );
}
