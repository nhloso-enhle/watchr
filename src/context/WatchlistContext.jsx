import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import client from '../api/client';

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems]       = useState([]);
  const [titleIds, setTitleIds] = useState(new Set());
  const [loading, setLoading]   = useState(false);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/watchlist');
      setItems(data);
      setTitleIds(new Set(data.map((i) => i.titleId)));
    } catch (err) {
      console.error('Watchlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchWatchlist();
    else { setItems([]); setTitleIds(new Set()); }
  }, [user, fetchWatchlist]);

  const addToWatchlist = async (titleData) => {
    const { data } = await client.post('/watchlist', titleData);
    setItems((prev) => [data, ...prev]);
    setTitleIds((prev) => new Set([...prev, data.titleId]));
    return data;
  };

  const removeFromWatchlist = async (titleId) => {
    await client.delete(`/watchlist/${titleId}`);
    setItems((prev) => prev.filter((i) => i.titleId !== titleId));
    setTitleIds((prev) => { const n = new Set(prev); n.delete(titleId); return n; });
  };

  const updateItem = async (titleId, updates) => {
    const { data } = await client.patch(`/watchlist/${titleId}`, updates);
    setItems((prev) => prev.map((i) => (i.titleId === titleId ? data : i)));
    return data;
  };

  const isInWatchlist = (titleId) => titleIds.has(titleId);
  const getItem       = (titleId) => items.find((i) => i.titleId === titleId);

  return (
    <WatchlistContext.Provider
      value={{ items, loading, fetchWatchlist, addToWatchlist, removeFromWatchlist, updateItem, isInWatchlist, getItem }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
