import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = username, 2 = new password, 3 = done
  const [identifier, setIdentifier] = useState(''); // username or email
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckUsername = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your username or email.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/forgot-password', { identifier, new_password: newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'User not found. Please check your username or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-base)'
    }}>
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(124,110,247,0.08) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" className="logo" style={{ textDecoration: 'none', fontSize: '1.8rem' }}>HabitChain</Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Reset your password
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem' }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: s <= step ? 'var(--primary)' : 'var(--border-default)',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Who are you?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Enter your <strong style={{color:'var(--text-sub)'}}>username</strong> or <strong style={{color:'var(--text-sub)'}}>email address</strong> to reset your password.
              </p>
              {error && <div style={errorStyle}>{error}</div>}
              <form onSubmit={handleCheckUsername} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Username or Email</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={btnStyle}>
                  Continue →
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Choose a new password
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Setting a new password for <strong style={{ color: 'var(--text-sub)' }}>{identifier}</strong>.
              </p>
              {error && <div style={errorStyle}>{error}</div>}
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    style={{ ...btnStyle, background: 'var(--bg-elevated)', color: 'var(--text-sub)', flex: 0.4 }}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ ...btnStyle, flex: 1 }}>
                    {loading ? 'Resetting...' : 'Reset password'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password reset!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.55 }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
                style={btnStyle}
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>

        {step !== 3 && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Remember it?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

const errorStyle = {
  padding: '0.7rem 1rem',
  borderRadius: 'var(--radius-md)',
  background: 'rgba(248, 113, 113, 0.1)',
  border: '1px solid rgba(248, 113, 113, 0.2)',
  color: 'var(--danger)',
  fontSize: '0.85rem',
  marginBottom: '1rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.4rem',
  fontSize: '0.85rem',
  color: 'var(--text-sub)',
  fontWeight: 500
};

const btnStyle = {
  width: '100%',
  justifyContent: 'center',
  borderRadius: '99px',
  padding: '0.75rem',
  border: 'none',
  cursor: 'pointer'
};

export default ForgotPassword;
