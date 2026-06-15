import { useState, useEffect } from 'react';
import { Star, Clock, CalendarDays, Sparkles } from 'lucide-react';
import client from '../api/client';

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86_400_000);
}

export default function Spotlight() {
  const [released, setReleased] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([client.get('/watchlist/spotlight'), client.get('/watchlist')]);
        setReleased(s.data || []);
        const yr = new Date().getFullYear();
        setUpcoming((a.data || []).filter(i => i.wasUpcoming && i.startYear > yr));
      } catch {
        setReleased([]); setUpcoming([]);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const isEmpty = !loading && released.length === 0 && upcoming.length === 0;

  return (
    <div className="min-h-screen page" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="py-12 px-6 text-center"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-center items-center gap-2 mb-2">
          <Star size={13} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
            Now Released
          </span>
          <Star size={13} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
        </div>
        <h1 className="font-bold mb-1.5" style={{ fontSize: '1.9rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Spotlight
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Upcoming titles you saved — shown for 2 weeks after release
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">

        {/* Spinner */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full anim-spin"
              style={{ border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)' }} />
          </div>
        )}

        {/* Released */}
        {!loading && released.length > 0 && (
          <section className="mt-10 mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                Just Released
              </span>
              <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                Showing for 2 weeks from release date
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {released.map((item, i) => {
                const days = daysSince(item.releasedAt);
                const label = days === 0 ? 'Today!' : days === 1 ? 'Yesterday' : `${days}d ago`;
                return (
                  <div key={item._id} className="card flex overflow-hidden anim-up"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="w-1 flex-shrink-0"
                      style={{ background: 'var(--accent)' }} />
                    <div className="w-24 flex-shrink-0 overflow-hidden" style={{ minHeight: '140px' }}>
                      {item.primaryImage?.url ? (
                        <img src={item.primaryImage.url} alt={item.primaryTitle}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ background: 'var(--bg-alt)' }} />
                      )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md mb-1.5"
                          style={{ background: 'var(--accent-sub)', color: 'var(--accent)' }}>
                          {label}
                        </span>
                        <h3 className="font-semibold leading-snug mb-0.5" style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                          {item.primaryTitle}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {item.startYear}{item.type ? ` · ${item.type}` : ''}
                        </p>
                        {item.rating?.aggregateRating && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs">
                            <span style={{ color: 'var(--gold)' }}>★</span>
                            <span className="font-semibold" style={{ color: 'var(--text)' }}>
                              {item.rating.aggregateRating.toFixed(1)}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <CalendarDays size={10} style={{ color: 'var(--text-3)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {new Date(item.releasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Still upcoming */}
        {!loading && upcoming.length > 0 && (
          <section className={released.length > 0 ? '' : 'mt-10'}>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={14} style={{ color: 'var(--text-3)' }} />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Still Waiting</h2>
              <span className="text-sm" style={{ color: 'var(--text-3)' }}>
                · {upcoming.length} upcoming title{upcoming.length !== 1 ? 's' : ''} in your list
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {upcoming.map((item, i) => (
                <div key={item._id} className="card overflow-hidden anim-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="relative" style={{ aspectRatio: '2/3' }}>
                    {item.primaryImage?.url ? (
                      <img src={item.primaryImage.url} alt={item.primaryTitle}
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.55) saturate(0.6)' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'var(--bg-alt)', color: 'var(--text-3)' }}>
                        <Clock size={20} />
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '0.6rem' }}>
                        {item.startYear ?? 'TBA'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium leading-tight line-clamp-2" style={{ color: 'var(--text)' }}>
                      {item.primaryTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex flex-col items-center text-center py-24">
            <Sparkles size={40} className="mb-3 opacity-15" style={{ color: 'var(--accent)' }} />
            <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text)' }}>
              Nothing in the Spotlight yet
            </p>
            <p className="text-sm max-w-sm" style={{ color: 'var(--text-3)' }}>
              Add upcoming titles to your watchlist and they'll appear here when they release
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
