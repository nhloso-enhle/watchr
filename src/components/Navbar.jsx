import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Compass, ListVideo, Star, Sparkles, LogOut, Sun, Moon } from 'lucide-react';
import DiceBearAvatar from './DiceBearAvatar';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { to: '/watchlist',       label: 'Watchlist', icon: ListVideo },
  { to: '/explore',         label: 'Explore',   icon: Compass   },
  { to: '/spotlight',       label: 'Spotlight', icon: Star      },
  { to: '/recommendations', label: 'For You',   icon: Sparkles  },
];

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
          isActive ? 'font-semibold' : 'hover:opacity-80'
        }`
      }
      style={({ isActive }) => ({
        color:      isActive ? 'var(--accent)' : 'var(--text-2)',
        background: isActive ? 'var(--accent-sub)' : 'transparent',
      })}
    >
      <Icon size={14} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* ── Primary row ── */}
      <div className="flex items-center px-4 sm:px-6 h-14 gap-3">

        {/* Brand */}
        <Link
          to="/watchlist"
          className="font-bold select-none transition-opacity hover:opacity-70 flex-shrink-0"
          style={{ fontFamily: 'Roboto, sans-serif', color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '-0.01em' }}
        >
          watchr.
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 mx-auto">
          {NAV.map(item => <NavItem key={item.to} {...item} />)}
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Divider */}
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />

          {/* Avatar → profile */}
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg px-1 py-1 transition-all hover:opacity-80"
          >
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-2)' }}>
              {user?.name || user?.username}
            </span>
            <DiceBearAvatar
              seed={user?.username || 'user'}
              style={user?.avatarStyle || 'bottts'}
              size={28}
            />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* ── Mobile nav row ── */}
      <div
        className="flex md:hidden overflow-x-auto px-2 pb-1 gap-0.5"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </div>
    </nav>
  );
}
