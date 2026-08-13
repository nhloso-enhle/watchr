import { useState } from 'react';
import { Sparkles, Plus, Check, RefreshCw, Bot } from 'lucide-react';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

const RANK_COLORS = ['#f5c518', '#c0c0d0', '#cd7f32'];
const RANK_BG     = ['rgba(245,197,24,0.12)', 'rgba(192,192,208,0.08)', 'rgba(205,127,50,0.08)'];

function RecCard({ rec, rank, onAdd, isAdding, inWatchlist }) {
  const imdb = rec.imdbData;

  return (
    <div className="rounded-2xl overflow-hidden flex group"
      style={{ background: '#111116', border: '1px solid #252530', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#252540'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#252530'; }}>

      {/* Rank stripe */}
      <div className="w-1 flex-shrink-0 rounded-l-2xl"
        style={{ background: RANK_COLORS[rank] }} />

      {/* Poster */}
      <div className="w-28 flex-shrink-0 overflow-hidden" style={{ minHeight: '168px' }}>
        {imdb?.primaryImage?.url ? (
          <img src={imdb.primaryImage.url} alt={rec.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: '#18181f', minHeight: '168px', color: '#8a8aa8' }}>
            <Sparkles size={22} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h3 className="font-bold leading-snug"
                style={{ fontFamily: "'Playfair Display', serif", color: '#f2f2f7', fontSize: '1.1rem' }}>
                {rec.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#8a8aa8' }}>
                {rec.year}
                {imdb?.type && ` · ${imdb.type}`}
                {imdb?.rating?.aggregateRating && (
                  <span style={{ color: '#f5c518' }}> · ★ {imdb.rating.aggregateRating.toFixed(1)}</span>
                )}
              </p>
            </div>

            {/* Rank badge */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: RANK_BG[rank], color: RANK_COLORS[rank], border: `1px solid ${RANK_COLORS[rank]}30` }}>
              {rank + 1}
            </div>
          </div>

          {/* AI reason */}
          <div className="flex gap-2 mt-3 mb-3">
            <Bot size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#a855f7' }} />
            <p className="text-sm leading-relaxed italic" style={{ color: '#a8a8be' }}>
              "{rec.reason}"
            </p>
          </div>

          {/* Genre pills */}
          {imdb?.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {imdb.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#18181f', color: '#8a8aa8', border: '1px solid #252530' }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4">
          <button
            onClick={onAdd}
            disabled={!imdb || inWatchlist || isAdding}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150"
            style={{
              background: inWatchlist ? 'rgba(34,197,94,0.12)' : !imdb ? '#18181f' : 'rgba(232,21,58,0.85)',
              color: inWatchlist ? '#4ade80' : !imdb ? '#8a8aa8' : 'white',
              border: inWatchlist ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
              cursor: (!imdb || inWatchlist) ? 'default' : 'pointer',
            }}
          >
            {inWatchlist ? <><Check size={11} /> In Watchlist</> : isAdding ? 'Adding…' : <><Plus size={11} /> Add to Watchlist</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recommendations() {
  const [recs, setRecs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [generated, setGenerated] = useState(false);
  const [emptyMsg, setEmptyMsg]   = useState('');
  const [adding, setAdding]       = useState({});
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const generate = async () => {
    setLoading(true);
    setError('');
    setEmptyMsg('');
    try {
      const { data } = await client.get('/recommendations');
      if (data.empty) {
        setEmptyMsg('Add some titles to your watchlist first, then come back for AI recommendations!');
        setRecs([]);
      } else {
        setRecs(data.recommendations || []);
      }
      setGenerated(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (rec) => {
    const imdb = rec.imdbData;
    if (!imdb) return;
    const id = imdb.id;
    if (isInWatchlist(id) || adding[id]) return;
    setAdding((p) => ({ ...p, [id]: true }));
    try {
      await addToWatchlist({
        titleId: id,
        primaryTitle: imdb.primaryTitle,
        originalTitle: imdb.originalTitle,
        type: imdb.type,
        startYear: imdb.startYear,
        primaryImage: imdb.primaryImage,
        rating: imdb.rating,
        genres: imdb.genres || [],
        plot: imdb.plot,
      });
    } catch { /* silent */ }
    setAdding((p) => ({ ...p, [id]: false }));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0d' }}>

      {/* Header */}
      <div className="relative py-14 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #111116 0%, #0a0a0d 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.1), transparent 60%)' }} />
        <div className="relative">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Bot size={14} style={{ color: '#a855f7' }} />
            <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#a855f7' }}>AI Powered</span>
          </div>
          <h1 className="font-bold mb-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', color: '#f2f2f7' }}>
            For You
          </h1>
          <p className="text-sm" style={{ color: '#8a8aa8' }}>
            3 personalised picks — generated from your watchlist taste
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        {/* Pre-generate prompt */}
        {!generated && !loading && (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(232,21,58,0.15), rgba(168,85,247,0.15))', border: '1px solid #252530' }}>
              <Sparkles size={36} style={{ color: '#a855f7' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#f2f2f7' }}>
              Ready for your picks?
            </h2>
            <p className="mb-8 max-w-sm text-sm" style={{ color: '#8a8aa8' }}>
              Claude analyses your watchlist to surface 3 titles you'll genuinely love
            </p>
            <button
              onClick={generate}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide flex items-center gap-2 transition-opacity hover:opacity-85"
              style={{ background: 'linear-gradient(135deg, #e8153a, #a855f7)', color: 'white' }}>
              <Sparkles size={15} />
              Generate Recommendations
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center text-center py-16 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: '2px solid #252530', borderTopColor: '#a855f7' }} />
              <div className="absolute inset-2 rounded-full animate-spin"
                style={{ border: '2px solid transparent', borderTopColor: '#e8153a', animationDirection: 'reverse', animationDuration: '0.55s' }} />
              <Sparkles size={18} className="absolute inset-0 m-auto" style={{ color: '#a855f7' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#f2f2f7' }}>Analysing your taste…</p>
              <p className="text-sm mt-1" style={{ color: '#8a8aa8' }}>This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-sm mb-4" style={{ color: '#e8153a' }}>{error}</p>
            <button onClick={generate}
              className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 mx-auto transition-all"
              style={{ background: '#111116', border: '1px solid #252530', color: '#f2f2f7' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e8153a'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#252530'}>
              <RefreshCw size={13} /> Try Again
            </button>
          </div>
        )}

        {/* Empty watchlist message */}
        {!loading && emptyMsg && (
          <div className="text-center py-12 rounded-2xl"
            style={{ background: '#111116', border: '1px solid #252530' }}>
            <Bot size={36} className="mx-auto mb-3 opacity-25" style={{ color: '#a855f7' }} />
            <p className="text-sm" style={{ color: '#8a8aa8' }}>{emptyMsg}</p>
          </div>
        )}

        {/* Rec cards */}
        {!loading && recs.length > 0 && (
          <>
            <div className="space-y-4">
              {recs.map((rec, i) => (
                <RecCard
                  key={i}
                  rec={rec}
                  rank={i}
                  onAdd={() => handleAdd(rec)}
                  isAdding={adding[rec.imdbData?.id]}
                  inWatchlist={rec.imdbData ? isInWatchlist(rec.imdbData.id) : false}
                />
              ))}
            </div>

            {/* Regenerate */}
            <div className="flex justify-center mt-8">
              <button
                onClick={generate}
                className="px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                style={{ background: '#111116', border: '1px solid #252530', color: '#8a8aa8' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.color = '#a855f7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#252530'; e.currentTarget.style.color = '#8a8aa8'; }}>
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
