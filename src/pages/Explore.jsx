import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Film, Tv2, Star } from 'lucide-react';
import client from '../api/client';
import TitleCard from '../components/TitleCard';
import TitleModal from '../components/TitleModal';
import Pagination from '../components/Pagination';

const PER_PAGE = 12;

function SkeletonItem() {
  return (
    <div className="card flex items-center gap-3 p-2.5" style={{ borderRadius: '12px' }}>
      <div className="skeleton flex-shrink-0 rounded-lg" style={{ width: 52, height: 78 }} />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-3/5" />
        <div className="skeleton h-2.5 w-2/5" />
        <div className="skeleton h-2.5 w-1/4" />
      </div>
      <div className="skeleton flex-shrink-0 rounded-lg h-7 w-16" />
    </div>
  );
}

export default function Explore() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [modalId, setModalId]   = useState(null);
  const [page, setPage]         = useState(1);
  const debounce = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    setPage(1);
    try {
      const { data } = await client.get('/titles/search', { params: { query: q, limit: 60 } });
      setResults(Array.isArray(data) ? data : []);
    } catch {
        if (err.response?.status === 502) {
          setResults([]);
          // Show a specific message for IMDb API failures
          setSearched(true);
        }
  }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(debounce.current);
  }, [query, doSearch]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const paged = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen page" style={{ background: 'var(--bg)' }}>

      {/* Hero search */}
      <div
        className="relative overflow-hidden py-12 px-6"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.1), transparent 65%)' }}
        />
        <div className="relative max-w-xl mx-auto text-center">
          <h1 className="font-bold mb-2"
            style={{ fontSize: '1.85rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Discover Your Next Watch
          </h1>
          <p className="mb-7 text-sm" style={{ color: 'var(--text-2)' }}>
            Search millions of titles from the IMDb database
          </p>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, series, shows…"
              autoFocus
              className="field"
              style={{ paddingLeft: '2.75rem', paddingRight: query ? '2.5rem' : '1rem', fontSize: '0.95rem' }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'var(--border)', color: 'var(--text-3)' }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">

        {/* Idle state */}
        {!searched && !loading && (
          <div className="flex flex-col items-center text-center py-20">
            <div className="flex gap-6 mb-6 opacity-15">
              <Film size={36} style={{ color: 'var(--accent)' }} />
              <Tv2 size={36} style={{ color: 'var(--text-3)' }} />
              <Star size={36} style={{ color: 'var(--gold)' }} />
            </div>
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
              What are you looking for?
            </p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              Search above — click a title name for full details
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-2 mt-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)}
          </div>
        )}

        {/* No results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
              No results for "{query}"
            </p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>Try a different search term</p>
          </div>
        )}

        {/* Results list */}
        {!loading && paged.length > 0 && (
          <>
            <p className="py-4 text-sm" style={{ color: 'var(--text-3)' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, results.length)} of{' '}
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{results.length}</span> results
              for <span style={{ color: 'var(--text)', fontWeight: 500 }}>"{query}"</span>
              <span style={{ color: 'var(--accent)', marginLeft: 6 }}>· click a name for details</span>
            </p>

            <div className="flex flex-col gap-2">
              {paged.map((title, i) => (
                <TitleCard
                  key={title.id}
                  title={title}
                  mode="explore"
                  animDelay={i * 25}
                  onTitleClick={id => setModalId(id)}
                />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
          </>
        )}
      </div>

      {modalId && <TitleModal titleId={modalId} onClose={() => setModalId(null)} />}
    </div>
  );
}
