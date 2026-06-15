import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const { isDark, toggle }    = useTheme();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/watchlist');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4"
      style={{ background: 'var(--bg)', overflow: 'hidden' }}>

      <AuthBackground />

      <button onClick={toggle}
        className="fixed top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)', zIndex: 10 }}>
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <div className="relative w-full max-w-sm anim-scale" style={{ zIndex: 1 }}>

        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <h1 className="font-bold"
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2.4rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
            watchr.
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
            The smarter way to track movies and TV.
          </p>
        </div>

        {/* Card */}
        <div className="card px-7 py-7">
          <h2 className="font-semibold mb-5" style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
            Create an account
          </h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', type: 'text',     label: 'Username', placeholder: 'filmfanatic',    min: 3 },
              { key: 'email',    type: 'email',    label: 'Email',    placeholder: 'you@example.com'        },
              { key: 'password', type: 'password', label: 'Password', placeholder: '••••••••',       min: 6 },
            ].map(({ key, type, label, placeholder, min }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>{label}</label>
                <input type={type} required value={form[key]} onChange={set(key)}
                  placeholder={placeholder} minLength={min} className="field" />
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-1"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
