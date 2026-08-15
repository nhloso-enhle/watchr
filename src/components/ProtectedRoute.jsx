import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="anim-spin" style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}
