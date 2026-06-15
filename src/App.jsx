import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider }    from './context/ThemeContext';
import { AuthProvider }     from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout         from './components/Layout';
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Explore        from './pages/Explore';
import Watchlist      from './pages/Watchlist';
import Spotlight      from './pages/Spotlight';
import Recommendations from './pages/Recommendations';

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

              {/* Protected — watchlist is the default landing page */}
              <Route path="/watchlist" element={
                <ProtectedRoute><Layout><Watchlist /></Layout></ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute><Layout><Explore /></Layout></ProtectedRoute>
              } />
              <Route path="/spotlight" element={
                <ProtectedRoute><Layout><Spotlight /></Layout></ProtectedRoute>
              } />
              <Route path="/recommendations" element={
                <ProtectedRoute><Layout><Recommendations /></Layout></ProtectedRoute>
              } />

              {/* Catch-all → watchlist */}
              <Route path="*" element={<Navigate to="/watchlist" replace />} />
            </Routes>
          </BrowserRouter>
        </WatchlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
