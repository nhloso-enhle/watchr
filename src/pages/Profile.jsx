import { useState } from 'react';
import { CheckCircle2, XCircle, User, Lock, Save } from 'lucide-react';
import DiceBearAvatar, { AVATAR_STYLES } from '../components/DiceBearAvatar';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

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
        ? <CheckCircle2 size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />
        : <XCircle      size={12} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
      <span style={{ fontSize: '0.72rem', color: ok ? 'var(--success)' : 'var(--text-3)' }}>{label}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6" style={{ marginBottom: '16px' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={16} style={{ color: 'var(--accent)' }} />
        <h2 className="font-semibold" style={{ fontSize: '1rem', color: 'var(--text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [info, setInfo] = useState({
    name:        user?.name        || '',
    username:    user?.username    || '',
    email:       user?.email       || '',
    avatarStyle: user?.avatarStyle || 'bottts',
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg,    setInfoMsg]    = useState('');
  const [infoErr,    setInfoErr]    = useState('');

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwMsg,     setPwMsg]     = useState('');
  const [pwErr,     setPwErr]     = useState('');
  const [pwFocused, setPwFocused] = useState(false);

  const rules       = validate(pw.next);
  const allRulesMet = Object.values(rules).every(Boolean);

  const setI = k => e => setInfo(p => ({ ...p, [k]: e.target.value }));
  const setP = k => e => setPw(p => ({ ...p, [k]: e.target.value }));

  /* ── Save profile ── */
  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoErr(''); setInfoMsg('');
    setInfoSaving(true);
    try {
      const { data } = await client.patch('/profile/update', info);
      updateUser(data);
      setInfoMsg('Profile updated successfully.');
    } catch (err) {
      setInfoErr(err.response?.data?.message || 'Failed to update profile.');
    } finally { setInfoSaving(false); }
  };

  /* ── Change password ── */
  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    if (!allRulesMet)           { setPwErr('New password does not meet all requirements.'); return; }
    if (pw.next !== pw.confirm) { setPwErr('New passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await client.patch('/profile/change-password', {
        currentPassword: pw.current,
        newPassword:     pw.next,
      });
      setPwMsg('Password changed successfully.');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Failed to change password.');
    } finally { setPwSaving(false); }
  };

  return (
    <div className="min-h-screen page px-4 sm:px-6 py-8 max-w-2xl mx-auto" style={{ background: 'var(--bg)' }}>
      <h1 className="font-bold mb-6"
        style={{ fontSize: '1.65rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
        My Profile
      </h1>

      {/* ── Avatar & Identity ── */}
      <Section title="Avatar & Identity" icon={User}>

        {/* Preview */}
        <div className="flex items-center gap-4 mb-6">
          <DiceBearAvatar
            seed={info.username || user?.username || 'user'}
            style={info.avatarStyle}
            size={64}
          />
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>
              {info.name || info.username}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>@{info.username}</p>
          </div>
        </div>

        {/* Style picker */}
        <div className="mb-6">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: 'var(--text-3)' }}>Avatar Style</label>
          <div className="flex flex-wrap gap-3">
            {AVATAR_STYLES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setInfo(p => ({ ...p, avatarStyle: key }))}
                className="flex flex-col items-center gap-1.5 transition-all"
                style={{
                  padding: '6px',
                  borderRadius: '12px',
                  border: `2px solid ${info.avatarStyle === key ? 'var(--accent)' : 'var(--border)'}`,
                  background: info.avatarStyle === key ? 'var(--accent-sub)' : 'transparent',
                }}
              >
                <DiceBearAvatar
                  seed={info.username || user?.username || 'user'}
                  style={key}
                  size={40}
                />
                <span style={{
                  fontSize: '0.62rem',
                  color: info.avatarStyle === key ? 'var(--accent)' : 'var(--text-3)',
                  fontWeight: 500,
                }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info fields */}
        <form onSubmit={handleInfoSave} className="space-y-4">
          {[
            { key: 'name',     label: 'Display Name', placeholder: 'Your full name',   type: 'text'  },
            { key: 'username', label: 'Username',      placeholder: 'filmfanatic',      type: 'text', min: 3 },
            { key: 'email',    label: 'Email',         placeholder: 'you@example.com', type: 'email' },
          ].map(({ key, label, placeholder, type, min }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-3)' }}>{label}</label>
              <input
                type={type}
                value={info[key]}
                onChange={setI(key)}
                placeholder={placeholder}
                minLength={min}
                className="field"
              />
            </div>
          ))}

          {infoErr && <p className="text-sm" style={{ color: 'var(--danger)' }}>{infoErr}</p>}
          {infoMsg && <p className="text-sm" style={{ color: 'var(--success)' }}>{infoMsg}</p>}

          <button type="submit" disabled={infoSaving}
            className="btn btn-primary flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Save size={14} />
            {infoSaving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password" icon={Lock}>
        <form onSubmit={handlePwSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-3)' }}>Current Password</label>
            <input type="password" required value={pw.current} onChange={setP('current')}
              placeholder="••••••••" className="field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-3)' }}>New Password</label>
            <input
              type="password" required value={pw.next}
              onChange={setP('next')} onFocus={() => setPwFocused(true)}
              placeholder="••••••••" className="field"
            />
            {(pwFocused || pw.next.length > 0) && (
              <div className="mt-2 p-3 rounded-xl space-y-1 anim-fade"
                style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
                <Rule ok={rules.length}    label="At least 8 characters" />
                <Rule ok={rules.uppercase} label="One uppercase letter" />
                <Rule ok={rules.number}    label="One number" />
                <Rule ok={rules.special}   label="One special character" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-3)' }}>Confirm New Password</label>
            <input
              type="password" required value={pw.confirm} onChange={setP('confirm')}
              placeholder="••••••••" className="field"
              style={{ borderColor: pw.confirm && pw.confirm !== pw.next ? 'var(--danger)' : undefined }}
            />
            {pw.confirm && pw.confirm !== pw.next && (
              <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>Passwords do not match</p>
            )}
          </div>

          {pwErr && <p className="text-sm" style={{ color: 'var(--danger)' }}>{pwErr}</p>}
          {pwMsg && <p className="text-sm" style={{ color: 'var(--success)' }}>{pwMsg}</p>}

          <button
            type="submit"
            disabled={pwSaving || !allRulesMet || pw.next !== pw.confirm}
            className="btn btn-primary flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Lock size={14} />
            {pwSaving ? 'Changing…' : 'Change password'}
          </button>
        </form>
      </Section>
    </div>
  );
}
