import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Play, Check, Heart, SortAsc, Compass } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import TitleCard from '../components/TitleCard';
import TitleModal from '../components/TitleModal';

const TABS = [
  { key: '',              label: 'All'           },
  { key: 'want_to_watch', label: 'Want to Watch' },
  { key: 'watching',      label: 'Watching'      },
  { key: 'completed',     label: 'Completed'     },
  { key: '__favourites',  label: '♥ Favourites'  },
];

const SORTS = [
  { key: 'added',  label: 'Date added'    },
  { key: 'title',  label: 'Title A–Z'     },
  { key: 'rating', label: 'Highest rated' },
  { key: 'year',   label: 'Year'          },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div className="p-3 space-y-2" style={{ background: 'var(--surface)' }}>
        <div className="skeleton h-3 w-4/5" />
        <div className="skeleton h-3 w-2/5" />
      </div>
    </div>
  );
}

export default function Watchlist() {
  const { items, loading } = useWatchlist();
  const [activeTab, setActiveTab] = useState('');
  const [sort, setSort]           = useState('added');
  const [modalId, setModalId]     = useState(null);

  const stats = useMemo(() => ({
    total:      items.length,
    watching:   items.filter(i => i.status === 'watching').length,
    completed:  items.filter(i => i.status === 'completed').length,
    favourites: items.filter(i => i.isFavourite).length,
  }), [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (activeTab === '__favourites') list = list.filter(i => i.isFavourite);
    else if (activeTab)               list = list.filter(i => i.status === activeTab);

    if (sort === 'title')       list.sort((a, b) => a.primaryTitle.localeCompare(b.primaryTitle));
    else if (sort === 'rating') list.sort((a, b) => (b.rating?.aggregateRating ?? 0) - (a.rating?.aggregateRating ?? 0));
    else if (sort === 'year')   list.sort((a, b) => (b.startYear ?? 0) - (a.startYear ?? 0));
    else                        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [items, activeTab, sort]);

  return (
    <div className="min-h-screen page px-6 py-8 max-w-7xl mx-auto" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold mb-0.5"
            style={{ fontSize: '1.65rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            My Watchlist
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {stats.total} title{stats.total !== 1 ? 's' : ''} saved
            {stats.total > 0 && (
              <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>
                · click a title name for details
              </span>
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <SortAsc size={13} style={{ color: 'var(--text-3)' }} />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm outline-none bg-transparent cursor-pointer"
              style={{ color: 'var(--text)', fontFamily: 'Roboto, sans-serif' }}>
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          <Link to="/explore">
            <button className="btn flex items-center gap-1.5 text-sm font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', paddingTop: '8px', paddingBottom: '8px' }}>
              <Compass size={13} />
              Find more titles
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',      value: stats.total,      icon: ListVideo, color: 'var(--text-2)' },
          { label: 'Watching',   value: stats.watching,   icon: Play,      color: '#3b82f6'       },
          { label: 'Completed',  value: stats.completed,  icon: Check,     color: 'var(--success)'},
          { label: 'Favourites', value: stats.favourites, icon: Heart,     color: 'var(--gold)'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
              <Icon size={15} />
            </div>
            <div>
              <p className="font-bold leading-none" style={{ color: 'var(--text)', fontSize: '1.35rem' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
              color:      activeTab === tab.key ? 'var(--accent-fg)' : 'var(--text-2)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <ListVideo size={40} className="mb-3 opacity-20" style={{ color: 'var(--text-3)' }} />
          <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text)' }}>
            {items.length === 0 ? 'Nothing saved yet' : 'No titles match this filter'}
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
            {items.length === 0 ? 'Head to Explore to start building your list' : 'Try a different filter'}
          </p>
          {items.length === 0 && (
            <Link to="/explore">
              <button className="btn btn-primary"><Compass size={14} /> Explore titles</button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, i) => (
            <TitleCard
              key={item.titleId}
              title={{ ...item, id: item.titleId }}
              mode="watchlist"
              animDelay={i * 30}
              onTitleClick={(id) => setModalId(id)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {modalId && <TitleModal titleId={modalId} onClose={() => setModalId(null)} />}
    </div>
  );
}
