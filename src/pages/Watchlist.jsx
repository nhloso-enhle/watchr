import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Play, Check, Heart, SortAsc, Compass } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import TitleCard   from '../components/TitleCard';
import TitleModal  from '../components/TitleModal';
import Pagination  from '../components/Pagination';

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

const PER_PAGE = 12;

function SkeletonItem() {
  return (
    <div className="card flex items-center gap-3 p-2.5" style={{ borderRadius: '12px' }}>
      <div className="skeleton flex-shrink-0 rounded-lg" style={{ width: 52, height: 78 }} />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-3/5" />
        <div className="skeleton h-2.5 w-2/5" />
      </div>
      <div className="skeleton flex-shrink-0 rounded-lg h-7 w-24" />
    </div>
  );
}

export default function Watchlist() {
  const { items, loading }    = useWatchlist();
  const [activeTab, setActiveTab] = useState('');
  const [sort, setSort]           = useState('added');
  const [modalId, setModalId]     = useState(null);
  const [page, setPage]           = useState(1);

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

  // Reset to page 1 when filter/sort changes
  const handleTab = (key) => { setActiveTab(key); setPage(1); };
  const handleSort = (key) => { setSort(key); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen page px-4 sm:px-6 py-8 max-w-3xl mx-auto" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold mb-0.5"
            style={{ fontSize: '1.65rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            My Watchlist
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {stats.total} title{stats.total !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <SortAsc size={13} style={{ color: 'var(--text-3)' }} />
            <select value={sort} onChange={e => handleSort(e.target.value)}
              className="text-sm outline-none bg-transparent cursor-pointer"
              style={{ color: 'var(--text)', fontFamily: 'Roboto, sans-serif' }}>
              {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <Link to="/explore">
            <button className="btn flex items-center gap-1.5 text-sm font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', padding: '8px 14px' }}>
              <Compass size={13} /> Find more titles
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',      value: stats.total,      icon: ListVideo, color: 'var(--text-2)' },
          { label: 'Watching',   value: stats.watching,   icon: Play,      color: '#3b82f6'       },
          { label: 'Completed',  value: stats.completed,  icon: Check,     color: 'var(--success)'},
          { label: 'Favourites', value: stats.favourites, icon: Heart,     color: 'var(--gold)'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3 p-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
              <Icon size={14} />
            </div>
            <div>
              <p className="font-bold leading-none" style={{ color: 'var(--text)', fontSize: '1.25rem' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => handleTab(tab.key)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
            style={{
              background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
              color:      activeTab === tab.key ? 'var(--accent-fg)' : 'var(--text-2)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonItem key={i} />)}
        </div>
      )}

      {/* Empty */}
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

      {/* List */}
      {!loading && paged.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {paged.map((item, i) => (
              <TitleCard
                key={item.titleId}
                title={{ ...item, id: item.titleId }}
                mode="watchlist"
                animDelay={i * 20}
                onTitleClick={id => setModalId(id)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
        </>
      )}

      {modalId && <TitleModal titleId={modalId} onClose={() => setModalId(null)} />}
    </div>
  );
}
