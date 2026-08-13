import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0d' }}>
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{ border: '2px solid #252530', borderTopColor: '#e8153a' }}
        />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
