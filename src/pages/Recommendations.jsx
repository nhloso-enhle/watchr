import { useState } from 'react';
import { Sparkles, Plus, Check, RefreshCw, Bot } from 'lucide-react';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

const RANK_ACCENT = ['var(--gold)', 'var(--text-2)', '#cd7f32'];
const RANK_LABEL  = ['#1', '#2', '#3'];

export default function Recommendations() {
  const [recs, setRecs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [generated, setGenerated] = useState(false);
  const [emptyMsg, setEmptyMsg]   = useState('');
  const [adding, setAdding]       = useState({});
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  const generate = async () => {
    setLoading(true); setError(''); setEmptyMsg('');
    try {
      const { data } = await client.get('/recommendations');
      if (data.empty) { setEmptyMsg('Add some titles to your watchlist first.'); setRecs([]); }
      else             { setRecs(data.recommendations || []); }
      setGenerated(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (rec) => {
    const imdb = rec.imdbData;
    if (!imdb) return;
    const id = imdb.id;
    if (isInWatchlist(id) || adding[id]) return;
    setAdding(p => ({ ...p, [id]: true }));
    try {
      await addToWatchlist({
        titleId: id, primaryTitle: imdb.primaryTitle, originalTitle: imdb.originalTitle,
        type: imdb.type, startYear: imdb.startYear, primaryImage: imdb.primaryImage,
        rating: imdb.rating, genres: imdb.genres || [], plot: imdb.plot,
      });
    } catch { /* silent */ }
    setAdding(p => ({ ...p, [id]: false }));
  };

  return (
    <div className="min-h-screen page" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="py-12 px-6 text-center"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-center items-center gap-2 mb-2">
          <Bot size={13} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
            AI Powered
          </span>
        </div>
        <h1 className="font-bold mb-1.5" style={{ fontSize: '1.9rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          For You
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          3 personalised picks — generated from your watchlist
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        {/* Pre-generate */}
        {!generated && !loading && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'var(--accent-sub)', border: '1px solid var(--accent-bd)' }}>
              <Sparkles size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-semibold text-xl mb-2" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Ready for your picks?
            </h2>
            <p className="mb-7 text-sm max-w-sm" style={{ color: 'var(--text-2)' }}>
              We analyse your watchlist to surface 3 titles you'll genuinely love
            </p>
            <button onClick={generate} className="btn btn-primary" style={{ fontWeight: 600, fontSize: '0.9rem', gap: '7px' }}>
              <Sparkles size={14} /> Generate recommendations
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center text-center py-16 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full anim-spin"
                style={{ border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)' }} />
              <Sparkles size={16} className="absolute inset-0 m-auto" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Analysing your taste…</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>This takes a few seconds</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-8">
            <p className="text-sm mb-4" style={{ color: 'var(--danger)' }}>{error}</p>
            <button onClick={generate} className="btn btn-ghost mx-auto flex items-center gap-1.5">
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        {/* Empty watchlist */}
        {!loading && emptyMsg && (
          <div className="card text-center py-12 mt-8">
            <Bot size={32} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>{emptyMsg}</p>
          </div>
        )}

        {/* Rec cards */}
        {!loading && recs.length > 0 && (
          <>
            <div className="space-y-4 mt-8">
              {recs.map((rec, i) => {
                const imdb = rec.imdbData;
                const id   = imdb?.id;
                const inWl = id ? isInWatchlist(id) : false;
                return (
                  <div key={i} className="card flex overflow-hidden anim-up" style={{ animationDelay: `${i * 80}ms` }}>
                    {/* Rank stripe */}
                    <div className="w-1 flex-shrink-0" style={{ background: RANK_ACCENT[i] }} />

                    {/* Poster */}
                    <div className="w-24 flex-shrink-0" style={{ minHeight: '160px' }}>
                      {imdb?.primaryImage?.url ? (
                        <img src={imdb.primaryImage.url} alt={rec.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: 'var(--bg-alt)', minHeight: '160px', color: 'var(--text-3)' }}>
                          <Sparkles size={20} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <h3 className="font-semibold leading-snug" style={{ color: 'var(--text)', fontSize: '1rem' }}>
                              {rec.title}
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {rec.year}
                              {imdb?.type && ` · ${imdb.type}`}
                              {imdb?.rating?.aggregateRating && (
                                <span style={{ color: 'var(--gold)' }}> · ★ {imdb.rating.aggregateRating.toFixed(1)}</span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs font-bold flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--bg-alt)', color: RANK_ACCENT[i], border: '1px solid var(--border)' }}>
                            {RANK_LABEL[i]}
                          </span>
                        </div>

                        {/* AI reason */}
                        <div className="flex gap-2 mt-2.5 mb-2.5">
                          <Bot size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-2)' }}>
                            "{rec.reason}"
                          </p>
                        </div>

                        {/* Genres */}
                        {imdb?.genres?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {imdb.genres.slice(0, 3).map(g => (
                              <span key={g} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--accent-sub)', color: 'var(--accent)', border: '1px solid var(--accent-bd)' }}>
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <button onClick={() => handleAdd(rec)} disabled={!imdb || inWl || adding[id]}
                          className="btn text-xs py-1.5 px-3"
                          style={{
                            background: inWl ? 'var(--accent-sub)' : !imdb ? 'var(--bg-alt)' : 'var(--accent)',
                            color:      inWl ? 'var(--accent)'     : !imdb ? 'var(--text-3)' : 'var(--accent-fg)',
                            border:     `1.5px solid ${inWl ? 'var(--accent-bd)' : 'transparent'}`,
                          }}>
                          {inWl ? <><Check size={11} /> In Watchlist</> : adding[id] ? 'Adding…' : <><Plus size={11} /> Add to Watchlist</>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-8">
              <button onClick={generate} className="btn btn-ghost flex items-center gap-1.5 text-sm">
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
