import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import client from '../api/client';

export default function ForgotPassword() {
  const { isDark, toggle } = useTheme();

  // Step 1: request code   Step 2: enter code + new password
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState('');
  const [devCode, setDevCode]   = useState('');   // shown in dev mode only
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  /* ── Step 1: request reset code ── */
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

  /* ── Step 2: submit new password ── */
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>

      <button onClick={toggle}
        className="fixed top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <div className="w-full max-w-sm anim-scale">

        {/* Back to login */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-2)' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        {/* Logo */}
        <div className="mb-8">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent-sub)', border: '1px solid var(--accent-bd)' }}>
            <KeyRound size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="font-bold text-xl mb-1" style={{ color: 'var(--text)' }}>
            {step === 1 ? 'Reset your password' : 'Enter your reset code'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {step === 1
              ? 'Enter your email and we\'ll send you a reset code.'
              : `A code was sent to ${email}. Enter it below to set a new password.`}
          </p>
        </div>

        <div className="card px-7 py-8">
          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm anim-fade text-center"
              style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.25)', color: 'var(--success)' }}>
              <p className="font-semibold mb-0.5">{success}</p>
              <Link to="/login" style={{ color: 'var(--accent)' }} className="text-xs hover:opacity-70 transition-opacity">
                Sign in now →
              </Link>
            </div>
          )}

          {/* Dev code hint */}
          {step === 2 && devCode && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm anim-fade"
              style={{ background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.25)', color: 'var(--gold)' }}>
              <p className="font-semibold text-xs uppercase tracking-wider mb-1">Dev mode — code returned in response</p>
              <p className="font-mono text-lg font-bold tracking-widest" style={{ color: 'var(--text)' }}>{devCode}</p>
              <p className="text-xs mt-1 opacity-70">In production, this would be emailed instead.</p>
            </div>
          )}

          {/* Step 1 form */}
          {!success && step === 1 && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="field" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full"
                style={{ fontWeight: 600 }}>
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          )}

          {/* Step 2 form */}
          {!success && step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>Reset code</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code" maxLength={6} className="field font-mono tracking-widest text-center text-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>New password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" minLength={6} className="field" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                  style={{ color: 'var(--text-3)' }}>Confirm password</label>
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
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
