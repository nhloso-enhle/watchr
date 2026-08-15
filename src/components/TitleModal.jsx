import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, Star, Clock, Film, Play, Tv2, ExternalLink } from 'lucide-react';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

function Pill({ children }) {
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 500, background: 'var(--accent-sub)', color: 'var(--accent)', border: '1px solid var(--accent-bd)' }}>{children}</span>;
}

function PersonRow({ label, people }) {
  if (!people?.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{people.map(p => p.displayName || p.name || p).join(', ')}</p>
    </div>
  );
}

function MetaHeader({ title, runtime, isTV }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <Pill>{isTV ? 'Series' : 'Movie'}</Pill>
        {title.startYear && <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{title.startYear}</span>}
        {runtime && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', color: 'var(--text-3)' }}><Clock size={11} /> {runtime}</span>}
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: 4 }}>{title.primaryTitle}</h2>
      {title.originalTitle && title.originalTitle !== title.primaryTitle && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic', marginBottom: 8 }}>orig. {title.originalTitle}</p>
      )}
      {title.rating?.aggregateRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Star size={14} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{title.rating.aggregateRating.toFixed(1)}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>/ 10 · {title.rating.voteCount?.toLocaleString()} votes</span>
        </div>
      )}
    </div>
  );
}

export default function TitleModal({ titleId, onClose }) {
  const [title, setTitle]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const { isInWatchlist, addToWatchlist } = useWatchlist();

  useEffect(() => {
    if (!titleId) return;
    setLoading(true); setTitle(null);
    client.get(`/titles/${titleId}`)
      .then(({ data }) => setTitle(data))
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [titleId]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const inWatchlist = title ? isInWatchlist(title.id) : false;
  const isTV        = title?.mediaType === 'tv' || title?.type === 'tvSeries';
  const runtime     = title?.runtimeSeconds ? `${Math.floor(title.runtimeSeconds / 60)}m` : null;

  const handleAdd = async () => {
    if (!title || inWatchlist || adding) return;
    setAdding(true);
    try {
      await addToWatchlist({ titleId: title.id, tmdbId: title.tmdbId, mediaType: title.mediaType, primaryTitle: title.primaryTitle, originalTitle: title.originalTitle, type: title.type, startYear: title.startYear, primaryImage: title.primaryImage, backdrop: title.backdrop, rating: title.rating, genres: title.genres || [], plot: title.plot || '', description: title.plot || '' });
    } catch {}
    setAdding(false);
  };

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 32px 72px rgba(0,0,0,0.4)', animation: 'modalIn 0.22s ease both' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-alt)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
          <X size={14} />
        </button>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}><div className="anim-spin" style={{ width: 32, height: 32, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)' }} /></div>}

        {!loading && !title && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px', textAlign: 'center' }}>
            <Film size={36} style={{ color: 'var(--text-3)', marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Couldn't load details</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>TMDB may be unavailable right now.</p>
          </div>
        )}

        {!loading && title && (
          <div>
            {/* Backdrop */}
            {title.backdrop?.url && (
              <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                <img src={title.backdrop.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                {title.trailer && (
                  <a href={`https://www.youtube.com/watch?v=${title.trailer}`} target="_blank" rel="noopener noreferrer"
                    style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '0.8rem', fontWeight: 600, backdropFilter: 'blur(4px)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <Play size={13} fill="white" /> Watch Trailer <ExternalLink size={11} style={{ opacity: 0.7 }} />
                  </a>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {!title.backdrop?.url && (
                <div style={{ width: 180, flexShrink: 0, minHeight: 260 }}>
                  {title.primaryImage?.url
                    ? <img src={title.primaryImage.url} alt={title.primaryTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 0 0 16px', minHeight: 260, display: 'block' }} />
                    : <div style={{ width: '100%', minHeight: 260, background: 'var(--bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px 0 0 16px', color: 'var(--text-3)' }}>{isTV ? <Tv2 size={40} /> : <Film size={40} />}</div>}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 260, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
                {title.backdrop?.url && title.primaryImage?.url && (
                  <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <img src={title.primaryImage.url} alt={title.primaryTitle} style={{ width: 70, borderRadius: 8, objectFit: 'cover', flexShrink: 0, alignSelf: 'flex-start' }} />
                    <div style={{ flex: 1 }}><MetaHeader title={title} runtime={runtime} isTV={isTV} /></div>
                  </div>
                )}
                {!title.backdrop?.url && <MetaHeader title={title} runtime={runtime} isTV={isTV} />}

                {title.genres?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>{title.genres.map(g => <Pill key={g}>{g}</Pill>)}</div>}
                {title.tagline && <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-3)', marginBottom: 10 }}>"{title.tagline}"</p>}
                {title.plot && <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-2)', marginBottom: 14 }}>{title.plot}</p>}

                {isTV && (title.seasons || title.episodes) && (
                  <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                    {title.seasons  && <div><p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Seasons</p><p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{title.seasons}</p></div>}
                    {title.episodes && <div><p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Episodes</p><p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{title.episodes}</p></div>}
                    {title.status   && <div><p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</p><p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{title.status}</p></div>}
                  </div>
                )}

                <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                  <PersonRow label="Director" people={title.directors} />
                  <PersonRow label="Stars"    people={title.stars}     />
                </div>

                <button onClick={handleAdd} disabled={inWatchlist || adding}
                  style={{ marginTop: 18, width: '100%', padding: '11px 16px', borderRadius: 10, fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '0.9rem', cursor: inWatchlist ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1.5px solid ${inWatchlist ? 'var(--accent-bd)' : 'transparent'}`, background: inWatchlist ? 'var(--accent-sub)' : 'var(--accent)', color: inWatchlist ? 'var(--accent)' : 'var(--accent-fg)', transition: 'opacity 0.15s', minHeight: 44 }}
                  onMouseEnter={e => { if (!inWatchlist) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  {inWatchlist ? <><Check size={14} /> In Watchlist</> : adding ? 'Adding…' : <><Plus size={14} /> Add to Watchlist</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
