import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider }     from './context/ThemeContext';
import { AuthProvider }      from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import ProtectedRoute  from './components/ProtectedRoute';
import Layout          from './components/Layout';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import Watchlist       from './pages/Watchlist';
import Explore         from './pages/Explore';
import Spotlight       from './pages/Spotlight';
import Recommendations from './pages/Recommendations';
import Profile         from './pages/Profile';

const Guard = ({ children }) => (
  <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login"           element={<Login />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected */}
              <Route path="/watchlist"       element={<Guard><Watchlist /></Guard>} />
              <Route path="/explore"         element={<Guard><Explore /></Guard>} />
              <Route path="/spotlight"       element={<Guard><Spotlight /></Guard>} />
              <Route path="/recommendations" element={<Guard><Recommendations /></Guard>} />
              <Route path="/profile"         element={<Guard><Profile /></Guard>} />

              {/* Default */}
              <Route path="*" element={<Navigate to="/watchlist" replace />} />
            </Routes>
          </BrowserRouter>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
