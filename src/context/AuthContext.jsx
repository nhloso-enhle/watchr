import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    client.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); })
      .finally(() => setLoading(false));
  }, []);

  // identifier = email OR username
  const login = async (identifier, password) => {
    const { data } = await client.post('/auth/login', { identifier, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await client.post('/auth/register', { username, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
