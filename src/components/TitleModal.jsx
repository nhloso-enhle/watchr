import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check, Star, Clock, Film } from 'lucide-react';
import client from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';

const TYPE_LABELS = {
  movie: 'Movie', tvSeries: 'TV Series', tvMiniSeries: 'Mini-Series',
  tvMovie: 'TV Movie', short: 'Short',
};

function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 500,
      background: 'var(--accent-sub)',
      color: 'var(--accent)',
      border: '1px solid var(--accent-bd)',
    }}>
      {children}
    </span>
  );
}

function PersonList({ label, people }) {
  if (!people?.length) return null;
  return (
    <div style={{ marginTop: '12px' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: '3px' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>
        {people.slice(0, 4).map(p => p.displayName || p).join(', ')}
      </p>
    </div>
  );
}

export default function TitleModal({ titleId, onClose }) {
  const [title, setTitle]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const { isInWatchlist, addToWatchlist } = useWatchlist();

  useEffect(() => {
    if (!titleId) return;
    setLoading(true);
    setTitle(null);
    client.get(`/titles/${titleId}`)
      .then(({ data }) => {
        const t = data?.id ? data : (data?.titles?.[0] ?? data);
        setTitle(t);
      })
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [titleId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const inWatchlist = title ? isInWatchlist(title.id) : false;

  const handleAdd = async () => {
    if (!title || inWatchlist || adding) return;
    setAdding(true);
    try {
      await addToWatchlist({
        titleId: title.id,
        primaryTitle:  title.primaryTitle,
        originalTitle: title.originalTitle,
        type:          title.type,
        startYear:     title.startYear,
        primaryImage:  title.primaryImage,
        rating:        title.rating,
        genres:        title.genres || [],
        plot:          title.plot,
        description:   title.plot || title.description || '',
      });
    } catch { /* silent */ }
    setAdding(false);
  };

  const runtime = title?.runtimeSeconds ? `${Math.floor(title.runtimeSeconds / 60)}m` : null;

  // Use React portal so the modal renders at document.body level,
  // bypassing any CSS stacking context created by parent animations.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 32px 72px rgba(0,0,0,0.35)',
          animation: 'modalIn 0.22s ease both',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 10,
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg-alt)',
            color: 'var(--text-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-alt)'}
        >
          <X size={14} />
        </button>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
            <div className="anim-spin" style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)',
            }} />
          </div>
        )}

        {/* Error */}
        {!loading && !title && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px', textAlign: 'center' }}>
            <Film size={36} style={{ color: 'var(--text-3)', marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Couldn't load details</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>The IMDb API may be unavailable right now.</p>
          </div>
        )}

        {/* Content */}
        {!loading && title && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Responsive flex: column on mobile, row on wider */}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>

              {/* Poster */}
              <div style={{ width: '200px', flexShrink: 0, minHeight: '280px' }}>
                {title.primaryImage?.url ? (
                  <img
                    src={title.primaryImage.url}
                    alt={title.primaryTitle}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '16px 0 0 16px',
                      minHeight: '280px',
                      maxHeight: '400px',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    minHeight: '280px',
                    background: 'var(--bg-alt)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px 0 0 16px',
                    color: 'var(--text-3)',
                  }}>
                    <Film size={40} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: '260px', padding: '24px', display: 'flex', flexDirection: 'column' }}>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {title.type && <Pill>{TYPE_LABELS[title.type] || title.type}</Pill>}
                  {title.startYear && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{title.startYear}</span>
                  )}
                  {runtime && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', color: 'var(--text-3)' }}>
                      <Clock size={11} /> {runtime}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: '4px', fontFamily: 'Roboto, sans-serif' }}>
                  {title.primaryTitle}
                </h2>
                {title.originalTitle && title.originalTitle !== title.primaryTitle && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic', marginBottom: '10px' }}>
                    orig. {title.originalTitle}
                  </p>
                )}

                {/* Rating */}
                {title.rating?.aggregateRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <Star size={14} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                      {title.rating.aggregateRating.toFixed(1)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      / 10 · {title.rating.voteCount?.toLocaleString()} votes
                    </span>
                  </div>
                )}

                {/* Genres */}
                {title.genres?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {title.genres.map(g => <Pill key={g}>{g}</Pill>)}
                  </div>
                )}

                {/* Plot / description */}
                {(title.plot || title.description) && (
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-2)', marginBottom: '14px' }}>
                    {title.plot || title.description}
                  </p>
                )}

                {/* Cast & crew */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                  <PersonList label="Director"   people={title.directors} />
                  <PersonList label="Stars"       people={title.stars}     />
                  <PersonList label="Written by"  people={title.writers}   />
                </div>

                {/* CTA */}
                <button
                  onClick={handleAdd}
                  disabled={inWatchlist || adding}
                  style={{
                    marginTop: '18px',
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: inWatchlist ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    border: `1.5px solid ${inWatchlist ? 'var(--accent-bd)' : 'transparent'}`,
                    background: inWatchlist ? 'var(--accent-sub)' : 'var(--accent)',
                    color: inWatchlist ? 'var(--accent)' : 'var(--accent-fg)',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!inWatchlist) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {inWatchlist
                    ? <><Check size={14} /> In Watchlist</>
                    : adding
                    ? 'Adding…'
                    : <><Plus size={14} /> Add to Watchlist</>}
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
