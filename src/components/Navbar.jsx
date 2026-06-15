import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, ListVideo, Star, Sparkles, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth }     from '../context/AuthContext';
import { useTheme }    from '../context/ThemeContext';

const NAV = [
  { to: '/watchlist',       label: 'Watchlist',   icon: ListVideo },
  { to: '/explore',         label: 'Explore',     icon: Compass   },
  { to: '/spotlight',       label: 'Spotlight',   icon: Star      },
  { to: '/recommendations', label: 'For You',     icon: Sparkles  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: 'var(--nav-bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Brand */}
      <NavLink
        to="/watchlist"
        className="font-bold select-none transition-opacity hover:opacity-70"
        style={{ fontFamily: "'Roboto', sans-serif", color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '-0.01em' }}
      >
        watchr.
      </NavLink>

      {/* Nav links */}
      <div className="flex items-center gap-0.5">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'font-semibold'
                  : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-sub)' : 'transparent',
            })}
          >
            <Icon size={14} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-2)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Divider */}
        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        {/* User chip */}
        <div className="flex items-center gap-2">
          <span className="text-sm hidden md:block" style={{ color: 'var(--text-2)' }}>{user?.username}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none flex-shrink-0"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            {initials}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-3)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-alt)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  );
}
