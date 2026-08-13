import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // CRITICAL: send cookies on every request (required for httpOnly session cookie)
  withCredentials: true,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear cached user profile but don't redirect — AuthContext handles that
      localStorage.removeItem('watchr-user');
    }
    return Promise.reject(err);
  }
);

export default client;
