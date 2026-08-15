import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const c = localStorage.getItem('watchr-user'); return c ? JSON.parse(c) : null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('watchr_token');
    if (!token) { setLoading(false); return; }
    client.get('/auth/me')
      .then(res => { setUser(res.data); localStorage.setItem('watchr-user', JSON.stringify(res.data)); })
      .catch(() => {
        localStorage.removeItem('watchr_token');
        localStorage.removeItem('watchr-user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password, stayLoggedIn = true) => {
    const { data } = await client.post('/auth/login', { identifier, password, stayLoggedIn });
    // Token comes in response body now
    localStorage.setItem('watchr_token', data.token);
    localStorage.setItem('watchr-user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await client.post('/auth/register', { username, email, password });
    localStorage.setItem('watchr_token', data.token);
    localStorage.setItem('watchr-user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await client.post('/auth/logout'); } catch {}
    localStorage.removeItem('watchr_token');
    localStorage.removeItem('watchr-user');
    setUser(null);
  };

  const updateUser = (fields) => {
    setUser(prev => {
      const next = { ...prev, ...fields };
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
