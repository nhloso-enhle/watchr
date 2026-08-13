import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

/*
  Session strategy:
  - Token is stored in an httpOnly cookie set by the backend (most secure, survives PWA restarts)
  - "Stay logged in" = long expiry (30 days) vs short expiry (1 day, closes with browser session)
  - localStorage stores a lightweight user profile object for instant UI rendering on load
    (no sensitive data — just username, name, avatarStyle)
  - The backend /auth/me validates the cookie and returns the full user object
*/

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    // Optimistic load from localStorage for instant render — verified by /auth/me below
    try {
      const cached = localStorage.getItem('watchr-user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always verify session with backend — cookie is sent automatically
    client.get('/auth/me')
      .then(res => {
        setUser(res.data);
        localStorage.setItem('watchr-user', JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('watchr-user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password, stayLoggedIn = false) => {
    const { data } = await client.post('/auth/login', { identifier, password, stayLoggedIn });
    setUser(data);
    localStorage.setItem('watchr-user', JSON.stringify(data));
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await client.post('/auth/register', { username, email, password });
    setUser(data);
    localStorage.setItem('watchr-user', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try { await client.post('/auth/logout'); } catch { /* silent */ }
    setUser(null);
    localStorage.removeItem('watchr-user');
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('watchr-user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
