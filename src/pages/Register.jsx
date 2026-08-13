import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import AuthBackground from '../components/AuthBackground';

function validate(pw) {
  return {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*()\-_=+[\]{};':",.<>?/\\|`~]/.test(pw),
  };
}

function Rule({ ok, label }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok
        ? <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
        : <XCircle      size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
      <span style={{ fontSize: '0.75rem', color: ok ? 'var(--success)' : 'var(--text-3)' }}>{label}</span>
    </div>
  );
}

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const { register }          = useAuth();
  const { isDark, toggle }    = useTheme();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const rules = validate(form.password);
  const allRulesMet = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!allRulesMet) { setError('Password does not meet all requirements.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
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
        <div className="text-center mb-8">
          <h1 className="font-bold"
            style={{ fontFamily: 'Roboto, sans-serif', fontSize: '2.4rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
            watchr.
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-2)', fontSize: '0.95rem' }}>
            The smarter way to track movies and TV.
          </p>
        </div>

        <div className="card px-7 py-7">
          <h2 className="font-semibold mb-5" style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
            Create an account
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}>Username</label>
              <input type="text" required value={form.username} onChange={set('username')}
                placeholder="filmfanatic" minLength={3} className="field" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}>Email</label>
              <input type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="field" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={set('password')}
                onFocus={() => setPwFocused(true)}
                placeholder="••••••••"
                className="field"
              />
              {/* Password rules — show when focused or if there's a value */}
              {(pwFocused || form.password.length > 0) && (
                <div className="mt-2 p-3 rounded-xl space-y-1 anim-fade"
                  style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                  <Rule ok={rules.length}    label="At least 8 characters" />
                  <Rule ok={rules.uppercase} label="One uppercase letter (A–Z)" />
                  <Rule ok={rules.number}    label="One number (0–9)" />
                  <Rule ok={rules.special}   label="One special character (!@#$…)" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}>Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="••••••••"
                className="field"
                style={{
                  borderColor: form.confirm && form.confirm !== form.password
                    ? 'var(--danger)' : undefined,
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allRulesMet || form.password !== form.confirm}
              className="btn btn-primary w-full mt-1"
              style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
