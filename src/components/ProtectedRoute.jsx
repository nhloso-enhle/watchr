import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}>
        <div className="w-9 h-9 rounded-full anim-spin"
          style={{ border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
