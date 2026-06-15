import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AuthBackground from '../components/AuthBackground';
import client from '../api/client';

export default function ForgotPassword() {
  const { isDark, toggle } = useTheme();
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState('');
  const [devCode, setDevCode]   = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await client.post('/auth/forgot-password', { email });
      setDevCode(data.devCode || '');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await client.post('/auth/reset-password', { email, code, newPassword: password });
      setSuccess(data.message || 'Password reset successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
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

        <Link to="/login"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-2)' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

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
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-sub)', border: '1px solid var(--accent-bd)' }}>
              <KeyRound size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ fontSize: '1.05rem', color: 'var(--text)' }}>
                {step === 1 ? 'Reset your password' : 'Enter reset code'}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                {step === 1
                  ? 'Enter your email to receive a reset code'
                  : `Code sent to ${email}`}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-center anim-fade"
              style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.25)', color: 'var(--success)' }}>
              <p className="font-semibold mb-1">{success}</p>
              <Link to="/login" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
                Sign in now →
              </Link>
            </div>
          )}

          {step === 2 && devCode && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.25)', color: 'var(--gold)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1">Dev mode — code</p>
              <p className="font-mono text-2xl font-bold tracking-widest" style={{ color: 'var(--text)' }}>{devCode}</p>
              <p className="text-xs mt-1 opacity-70">In production this would be emailed.</p>
            </div>
          )}

          {!success && step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>Email address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="field" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full"
                style={{ fontWeight: 600 }}>
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          )}

          {!success && step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>6-digit code</label>
                <input type="text" required value={code} onChange={e => setCode(e.target.value)}
                  placeholder="123456" maxLength={6}
                  className="field font-mono tracking-widest text-center text-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>New password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" minLength={6} className="field" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>Confirm password</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" className="field" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="btn btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1"
                  style={{ fontWeight: 600 }}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
