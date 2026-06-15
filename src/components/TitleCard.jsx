import { useState } from 'react';
import { Plus, Check, Heart } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const TYPE_LABELS = {
  movie: 'Movie', tvSeries: 'Series', tvMiniSeries: 'Mini-Series',
  tvMovie: 'TV Movie', short: 'Short', tvSpecial: 'Special',
};

export default function TitleCard({ title, mode = 'explore', onTitleClick, animDelay = 0 }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, updateItem, getItem } = useWatchlist();
  const [adding, setAdding] = useState(false);

  const id            = title.id || title.titleId;
  const primaryTitle  = title.primaryTitle;
  const imageUrl      = title.primaryImage?.url;
  const rating        = title.rating?.aggregateRating;
  const year          = title.startYear;
  const type          = title.type;
  const genres        = title.genres || [];
  const inWatchlist   = isInWatchlist(id);
  const saved         = getItem(id);
  const isFavourite   = saved?.isFavourite ?? false;
  const currentStatus = saved?.status ?? 'want_to_watch';

  const handleAdd = async () => {
    if (inWatchlist || adding) return;
    setAdding(true);
    try {
      await addToWatchlist({
        titleId: id, primaryTitle, originalTitle: title.originalTitle,
        type, startYear: year, primaryImage: title.primaryImage,
        rating: title.rating, genres, plot: title.plot,
        description: title.plot || title.description || '',
      });
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const handleRemove = async () => {
    try { await removeFromWatchlist(id); } catch (err) { console.error(err); }
  };

  const handleFavourite = async () => {
    try { await updateItem(id, { isFavourite: !isFavourite }); } catch (err) { console.error(err); }
  };

  const handleStatus = async (e) => {
    e.stopPropagation();
    try { await updateItem(id, { status: e.target.value }); } catch (err) { console.error(err); }
  };

  const statusDot = {
    want_to_watch: 'var(--text-3)',
    watching:      '#3b82f6',
    completed:     'var(--success)',
  };

  const canClick = !!onTitleClick;

  return (
    <div
      className="card flex flex-col anim-up overflow-hidden"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Poster */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '2/3' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={primaryTitle}
            className="w-full h-full object-cover"
            style={{ transition: 'transform 0.35s ease' }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center px-4 text-center text-sm font-medium"
            style={{ background: 'var(--bg-alt)', color: 'var(--text-3)' }}>
            {primaryTitle}
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-2.5"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }}
        >
          {rating && (
            <span className="flex items-center gap-1 mb-1" style={{ fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--gold)' }}>★</span>
              <span className="font-medium text-white">{rating.toFixed(1)}</span>
            </span>
          )}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {genres.slice(0, 2).map(g => (
                <span key={g} className="px-1.5 py-0.5 rounded text-white"
                  style={{ background: 'rgba(37,99,235,0.55)', fontSize: '0.6rem', fontWeight: 500 }}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Type badge */}
        {type && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(0,0,0,0.72)', color: 'rgba(255,255,255,0.75)', fontSize: '0.6rem', backdropFilter: 'blur(4px)' }}>
            {TYPE_LABELS[type] || type}
          </div>
        )}

        {/* Favourite pip */}
        {mode === 'watchlist' && isFavourite && (
          <div className="absolute top-2 right-2">
            <Heart size={13} fill="var(--gold)" style={{ color: 'var(--gold)' }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-1 flex-1">
        <h3
          className="font-medium leading-snug line-clamp-2 text-sm"
          style={{
            color: 'var(--text)',
            cursor: canClick ? 'pointer' : 'default',
            transition: 'color 0.15s',
          }}
          onClick={() => onTitleClick?.(id)}
          onMouseEnter={e => { if (canClick) e.target.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { if (canClick) e.target.style.color = 'var(--text)'; }}
        >
          {primaryTitle}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>{year || 'TBA'}</p>
          {mode === 'watchlist' && (
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: statusDot[currentStatus] }} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 pt-1">
        {mode === 'explore' ? (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="btn w-full text-xs py-1.5"
            style={{
              background: inWatchlist ? 'var(--accent-sub)' : 'var(--accent)',
              color:      inWatchlist ? 'var(--accent)'     : 'var(--accent-fg)',
              border:     `1.5px solid ${inWatchlist ? 'var(--accent-bd)' : 'transparent'}`,
            }}
          >
            {inWatchlist ? <><Check size={11} /> Saved</> : adding ? 'Adding…' : <><Plus size={11} /> Add</>}
          </button>
        ) : (
          <div className="flex flex-col gap-1.5">
            <select
              value={currentStatus}
              onChange={handleStatus}
              className="field text-xs py-1.5"
              style={{ fontSize: '0.75rem' }}
            >
              <option value="want_to_watch">⏱ Want to Watch</option>
              <option value="watching">▶ Watching</option>
              <option value="completed">✓ Completed</option>
            </select>
            <div className="flex gap-1.5">
              <button
                onClick={handleFavourite}
                className="btn btn-ghost flex-1 text-xs py-1.5"
                style={{
                  color:       isFavourite ? 'var(--gold)'           : 'var(--text-2)',
                  borderColor: isFavourite ? 'var(--gold)'           : 'var(--border)',
                  background:  isFavourite ? 'rgba(217,119,6,0.07)' : 'transparent',
                }}
              >
                <Heart size={11} fill={isFavourite ? 'var(--gold)' : 'none'} />
                Fav
              </button>
              <button
                onClick={handleRemove}
                className="btn btn-ghost flex-1 text-xs py-1.5"
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
