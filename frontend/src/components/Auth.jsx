import React, { useState } from 'react';
import { Mail, Lock, User, BookOpen } from 'lucide-react';
import { API_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      // Connect to the backend
      const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        onLoginSuccess(data.user);
      } else {
        // Automatically login after successful signup
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          onLoginSuccess(loginData.user);
        } else {
          setError('Account created, please sign in manually.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    // Simulate Google Login
    // Prompt for a gmail
    const mockGmail = prompt("Enter your Gmail address:", "");
    if (!mockGmail) {
      setLoading(false);
      return;
    }

    if (!mockGmail.includes('@') || !mockGmail.toLowerCase().endsWith('.com')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const mockName = mockGmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockGmail,
          name: mockName,
          isGoogleLogin: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate with Google');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ justifyContent: 'center' }}>
            <img src="/logo.png" alt="Logo" className="nav-logo-img" style={{ height: '85px' }} />
          </div>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to access B.Tech notes & papers' : 'Create an account to start studying'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button 
          type="button" 
          className="auth-google-btn" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.8 2.17c1.63-1.5 2.8-3.7 2.8-6.5z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.8-2.17c-.78.52-1.78.83-2.96.83-2.28 0-4.2-1.54-4.9-3.61L1.4 13.06C2.9 16.03 6 18 9 18z"/>
            <path fill="#FBBC05" d="M4.1 10.85c-.18-.53-.28-1.1-.28-1.68s.1-1.15.28-1.68L1.4 5.34C.5 7.15 0 9.17 0 11.25s.5 4.1 1.4 5.91l2.7-2.31z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.47.89 11.43 0 9 0 6 0 2.9 1.97 1.4 4.94l2.7 2.31c.7-2.07 2.62-3.67 4.9-3.67z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="auth-divider">or use email</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input 
                  id="fullName"
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. Rahul Kumar" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="emailAddress">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input 
                id="emailAddress"
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. student@college.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accountPassword">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input 
                id="accountPassword"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle-link">
          {isLogin ? (
            <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></>
          ) : (
            <>Already have an account? <span onClick={() => setIsLogin(true)}>Sign In</span></>
          )}
        </p>
      </div>
    </div>
  );
}
