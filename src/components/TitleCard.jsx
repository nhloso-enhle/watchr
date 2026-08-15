import { useState } from 'react';
import { Plus, Check, Heart, Film } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const TYPE_LABELS = { movie: 'Movie', tvSeries: 'Series', tvMiniSeries: 'Mini-Series', tvMovie: 'TV Movie', short: 'Short', tv: 'Series' };
const STATUS_OPTIONS = [{ value: 'want_to_watch', label: '⏱ Want to Watch' }, { value: 'watching', label: '▶ Watching' }, { value: 'completed', label: '✓ Completed' }];
const STATUS_COLOR = { want_to_watch: 'var(--text-3)', watching: '#3b82f6', completed: 'var(--success)' };

export default function TitleCard({ title, mode = 'explore', onTitleClick, animDelay = 0 }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, updateItem, getItem } = useWatchlist();
  const [adding, setAdding] = useState(false);

  const id           = title.id || title.titleId;
  const primaryTitle = title.primaryTitle;
  const imageUrl     = title.primaryImage?.url;
  const rating       = title.rating?.aggregateRating;
  const year         = title.startYear;
  const type         = title.type || title.mediaType;
  const genres       = title.genres || [];
  const inWatchlist  = isInWatchlist(id);
  const saved        = getItem(id);
  const isFavourite  = saved?.isFavourite ?? false;
  const status       = saved?.status ?? 'want_to_watch';

  const handleAdd = async () => {
    if (inWatchlist || adding) return;
    setAdding(true);
    try {
      await addToWatchlist({ titleId: id, tmdbId: title.tmdbId, mediaType: title.mediaType, primaryTitle, originalTitle: title.originalTitle, type, startYear: year, primaryImage: title.primaryImage, backdrop: title.backdrop, rating: title.rating, genres, plot: title.plot || '', description: title.plot || title.description || '' });
    } catch (err) { console.error(err); }
    finally { setAdding(false); }
  };

  const handleRemove    = async () => { try { await removeFromWatchlist(id); } catch {} };
  const handleFavourite = async () => { try { await updateItem(id, { isFavourite: !isFavourite }); } catch {} };
  const handleStatus    = async (e) => { e.stopPropagation(); try { await updateItem(id, { status: e.target.value }); } catch {} };

  return (
    <div className="card anim-up flex items-center gap-3 p-2.5" style={{ animationDelay: `${animDelay}ms`, borderRadius: '12px' }}>
      {/* Poster */}
      <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 52, height: 78, background: 'var(--bg-alt)' }}>
        {imageUrl ? <img src={imageUrl} alt={primaryTitle} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Film size={18} style={{ color: 'var(--text-3)' }} /></div>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm leading-snug line-clamp-2"
          style={{ color: 'var(--text)', cursor: onTitleClick ? 'pointer' : 'default', transition: 'color 0.15s' }}
          onClick={() => onTitleClick?.(id)}
          onMouseEnter={e => { if (onTitleClick) e.target.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { if (onTitleClick) e.target.style.color = 'var(--text)'; }}>
          {primaryTitle}
        </h3>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
          {year && <span style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>{year}</span>}
          {type && <span style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>{TYPE_LABELS[type] || type}</span>}
          {rating && <span className="flex items-center gap-0.5" style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--gold)' }}>★</span><span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{rating.toFixed(1)}</span></span>}
          {mode === 'watchlist' && <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[status] }} />}
        </div>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.slice(0, 2).map(g => <span key={g} style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '999px', background: 'var(--accent-sub)', color: 'var(--accent)', border: '1px solid var(--accent-bd)' }}>{g}</span>)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1.5">
        {mode === 'explore' ? (
          <button onClick={handleAdd} disabled={adding} className="btn text-xs"
            style={{ padding: '6px 12px', minHeight: '36px', background: inWatchlist ? 'var(--accent-sub)' : 'var(--accent)', color: inWatchlist ? 'var(--accent)' : 'var(--accent-fg)', border: `1.5px solid ${inWatchlist ? 'var(--accent-bd)' : 'transparent'}`, fontSize: '0.75rem' }}>
            {inWatchlist ? <><Check size={11} /> Saved</> : adding ? '…' : <><Plus size={11} /> Add</>}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <select value={status} onChange={handleStatus} className="field" style={{ padding: '5px 7px', fontSize: '0.72rem', borderRadius: '8px', width: 'auto', maxWidth: '120px', minHeight: '36px' }}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={handleFavourite} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${isFavourite ? 'rgba(217,119,6,0.35)' : 'var(--border)'}`, background: isFavourite ? 'rgba(217,119,6,0.1)' : 'var(--bg-alt)', color: isFavourite ? 'var(--gold)' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} title="Favourite">
              <Heart size={12} fill={isFavourite ? 'var(--gold)' : 'none'} />
            </button>
            <button onClick={handleRemove} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-alt)', color: 'var(--text-3)', fontSize: '1.1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }} title="Remove">×</button>
          </div>
        )}
      </div>
    </div>
  );
}
