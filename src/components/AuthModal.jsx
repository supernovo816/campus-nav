import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Eye icons (inline SVG — no external dependency needed) ──
function EyeOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/**
 * AuthModal
 * Renders a full-screen overlay with Login / Register tabs.
 * Call onClose() when authentication succeeds or the user dismisses.
 */
export default function AuthModal({ onClose, onSuccess }) {
  const { login, register } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Login form state ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  // ── Register form state ──
  const [regNo, setRegNo] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const resetErrors = () => { setError(''); setSuccess(''); };

  // ── Handle Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    resetErrors();
    if (!loginEmail || !loginPassword) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const { error: err } = await login({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess?.();
  };

  // ── Handle Register ──
  const handleRegister = async (e) => {
    e.preventDefault();
    resetErrors();
    if (!regNo || !regName || !regEmail || !regPassword || !regConfirm) {
      setError('Please fill in all fields.'); return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.'); return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true);
    const { error: err } = await register({
      registrationNo: regNo,
      name: regName,
      email: regEmail,
      password: regPassword,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess('Account created! Please check your email to confirm, then log in.');
    setTab('login');
    setLoginEmail(regEmail);
  };

  return (
    <div className="auth-overlay" id="auth-modal-overlay" role="dialog" aria-modal="true" aria-label="Authentication">
      {/* Backdrop — click to dismiss */}
      <div className="auth-backdrop" onClick={onClose} />

      <div className="auth-modal" id="auth-modal">
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-logo-row">
            <span className="auth-turf-icon">⚽</span>
            <div>
              <h2>VISTAS Turf Booking</h2>
              <p>Sign in to book the campus turf</p>
            </div>
          </div>
          <button className="auth-close-btn" id="auth-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn${tab === 'login' ? ' active' : ''}`}
            id="auth-tab-login"
            onClick={() => { setTab('login'); resetErrors(); }}
          >
            Login
          </button>
          <button
            className={`auth-tab-btn${tab === 'register' ? ' active' : ''}`}
            id="auth-tab-register"
            onClick={() => { setTab('register'); resetErrors(); }}
          >
            Register
          </button>
        </div>

        {/* Error / success banners */}
        {error && <div className="auth-error" role="alert">{error}</div>}
        {success && <div className="auth-success" role="status">{success}</div>}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form className="auth-form" id="login-form" onSubmit={handleLogin} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                placeholder="student@vistas.ac.in"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="pw-input-wrapper">
                <input
                  id="login-password"
                  type={showLoginPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  id="login-pw-toggle"
                  onClick={() => setShowLoginPw((v) => !v)}
                  aria-label={showLoginPw ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showLoginPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>
            <button
              className="auth-submit-btn"
              id="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <p className="auth-switch-hint">
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-link-btn" onClick={() => { setTab('register'); resetErrors(); }}>
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form className="auth-form" id="register-form" onSubmit={handleRegister} noValidate>
            <div className="auth-field">
              <label htmlFor="reg-no">Registration Number</label>
              <input
                id="reg-no"
                type="text"
                placeholder="e.g. UV26G248052"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                autoComplete="off"
                maxLength={11}
                required
              />
              <small>Format: UV26G248052 (2 letters, 2 digits, 1 letter, 6 digits)</small>
            </div>
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Your full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="student@vistas.ac.in"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <div className="pw-input-wrapper">
                <input
                  id="reg-password"
                  type={showRegPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  id="reg-pw-toggle"
                  onClick={() => setShowRegPw((v) => !v)}
                  aria-label={showRegPw ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showRegPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="pw-input-wrapper">
                <input
                  id="reg-confirm"
                  type={showRegConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="pw-toggle-btn"
                  id="reg-confirm-toggle"
                  onClick={() => setShowRegConfirm((v) => !v)}
                  aria-label={showRegConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={0}
                >
                  {showRegConfirm ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>
            <button
              className="auth-submit-btn"
              id="register-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
            <p className="auth-switch-hint">
              Already have an account?{' '}
              <button type="button" className="auth-link-btn" onClick={() => { setTab('login'); resetErrors(); }}>
                Login here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
