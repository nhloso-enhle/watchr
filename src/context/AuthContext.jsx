import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

/* ─────────────────────────────────────────────────────────────
   Session strategy:
   • "Stay logged in" checked  → token in localStorage  (persists across browser restarts)
   • "Stay logged in" unchecked → token in sessionStorage (cleared when tab/browser closes)
   
   On every mount we check both stores so existing sessions from
   either strategy are restored correctly.
───────────────────────────────────────────────────────────── */
function readToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
}

function saveToken(token, persist) {
  if (persist) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
}

function clearToken() {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (!token) { setLoading(false); return; }
    client.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  /**
   * login
   * @param {string}  identifier  — email OR username
   * @param {string}  password
   * @param {boolean} stayLoggedIn — true → localStorage, false → sessionStorage
   */
  const login = async (identifier, password, stayLoggedIn = false) => {
    const { data } = await client.post('/auth/login', { identifier, password });
    saveToken(data.token, stayLoggedIn);
    setUser(data);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await client.post('/auth/register', { username, email, password });
    // New registrations always persist — user just signed up, don't make them log in again
    saveToken(data.token, true);
    setUser(data);
    return data;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
