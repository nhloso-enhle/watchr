import { useState, useEffect } from 'react';
import { Star, Clock, CalendarDays, Sparkles } from 'lucide-react';
import client from '../api/client';

function daysSince(date) {
  return Math.floor((Date.now() - new Date(date)) / 86_400_000);
}

function ReleasedCard({ item }) {
  const days = daysSince(item.releasedAt);
  const label = days === 0 ? 'Today!' : days === 1 ? 'Yesterday' : `${days}d ago`;

  return (
    <div className="rounded-2xl overflow-hidden flex"
      style={{ background: '#111116', border: '1px solid #252530' }}>

      {/* Red left strip */}
      <div className="w-1 flex-shrink-0" style={{ background: 'linear-gradient(to bottom, #e8153a, #b01029)' }} />

      {/* Poster */}
      <div className="w-28 flex-shrink-0 overflow-hidden" style={{ minHeight: '160px' }}>
        {item.primaryImage?.url ? (
          <img src={item.primaryImage.url} alt={item.primaryTitle}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: '#18181f', color: '#8a8aa8' }}>
            <Star size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <span className="inline-block text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded mb-2"
            style={{ background: 'rgba(232,21,58,0.15)', color: '#e8153a' }}>
            {label}
          </span>
          <h3 className="font-bold leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#f2f2f7', fontSize: '1.05rem' }}>
            {item.primaryTitle}
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: '#8a8aa8' }}>
            {item.startYear}{item.type ? ` · ${item.type}` : ''}
          </p>
          {item.rating?.aggregateRating && (
            <p className="mt-2 flex items-center gap-1 text-sm">
              <span style={{ color: '#f5c518' }}>★</span>
              <span className="font-semibold" style={{ color: '#f2f2f7' }}>
                {item.rating.aggregateRating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: '#8a8aa8' }}>
                ({item.rating.voteCount?.toLocaleString()} votes)
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <CalendarDays size={11} style={{ color: '#8a8aa8' }} />
          <span className="text-xs" style={{ color: '#8a8aa8' }}>
            Released {new Date(item.releasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Spotlight() {
  const [released, setReleased]   = useState([]);
  const [upcoming, setUpcoming]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [spotRes, allRes] = await Promise.all([
          client.get('/watchlist/spotlight'),
          client.get('/watchlist'),
        ]);
        setReleased(spotRes.data || []);
        const currentYear = new Date().getFullYear();
        setUpcoming((allRes.data || []).filter((i) => i.wasUpcoming && i.startYear > currentYear));
      } catch {
        setReleased([]);
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isEmpty = !loading && released.length === 0 && upcoming.length === 0;

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0d' }}>

      {/* Header */}
      <div className="relative py-14 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #111116 0%, #0a0a0d 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245,197,24,0.08), transparent 60%)' }} />
        <div className="relative">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Star size={14} style={{ color: '#f5c518' }} fill="#f5c518" />
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#f5c518' }}>Now Released</span>
            <Star size={14} style={{ color: '#f5c518' }} fill="#f5c518" />
          </div>
          <h1 className="font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', color: '#f2f2f7' }}>
            Spotlight
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#8a8aa8' }}>
            Upcoming titles you saved — now on the screen
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">

        {/* Spinner */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full animate-spin"
              style={{ border: '2px solid #252530', borderTopColor: '#f5c518' }} />
          </div>
        )}

        {/* Released section */}
        {!loading && released.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
                style={{ background: '#e8153a', color: 'white' }}>
                Just Released
              </span>
              <span className="text-sm" style={{ color: '#8a8aa8' }}>
                Titles you saved before they dropped — showing for 2 weeks
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {released.map((item) => <ReleasedCard key={item._id} item={item} />)}
            </div>
          </section>
        )}

        {/* Still upcoming section */}
        {!loading && upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock size={16} style={{ color: '#8a8aa8' }} />
              <h2 className="font-semibold text-base" style={{ color: '#f2f2f7' }}>Still Waiting</h2>
              <span className="text-sm" style={{ color: '#8a8aa8' }}>
                · {upcoming.length} upcoming title{upcoming.length !== 1 ? 's' : ''} in your list
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {upcoming.map((item) => (
                <div key={item._id} className="rounded-xl overflow-hidden"
                  style={{ background: '#111116', border: '1px solid #252530' }}>
                  <div className="relative" style={{ aspectRatio: '2/3' }}>
                    {item.primaryImage?.url ? (
                      <img src={item.primaryImage.url} alt={item.primaryTitle}
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.55) saturate(0.7)' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: '#18181f', color: '#8a8aa8' }}>
                        <Clock size={22} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end p-2"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(10,10,13,0.85)', color: '#f5c518' }}>
                        {item.startYear ?? 'TBA'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium leading-tight line-clamp-2" style={{ color: '#f2f2f7' }}>
                      {item.primaryTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center text-center py-24">
            <Sparkles size={48} className="mb-4 opacity-20" style={{ color: '#f5c518' }} />
            <p className="text-xl font-semibold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#f2f2f7' }}>
              Nothing in the Spotlight yet
            </p>
            <p className="text-sm max-w-sm" style={{ color: '#8a8aa8' }}>
              Add upcoming titles to your watchlist and they'll appear here when they release
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
