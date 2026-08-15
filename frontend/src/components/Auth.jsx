import React, { useState } from 'react';
import { API_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider) => {
    setError('');
    setLoading(true);

    // Simulate OAuth Login
    const mockEmail = prompt(`Enter your ${provider} email address (must end with @jklu.edu.in):`, "");
    if (!mockEmail) {
      setLoading(false);
      return;
    }

    if (!mockEmail.toLowerCase().endsWith('@jklu.edu.in')) {
      setError('Please enter a valid @jklu.edu.in email address');
      setLoading(false);
      return;
    }

    const mockName = mockEmail.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: mockEmail,
          name: mockName,
          provider: provider,
          isGoogleLogin: provider === 'Google'
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
          <div className="logo" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <img src="/logo.png" alt="Logo" className="nav-logo-img" style={{ height: '85px' }} />
            <h2 className="hero-brand-name" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
              {"Backbenchers".split('').map((char, idx) => (
                <span 
                  key={idx} 
                  className="dance-letter" 
                  style={{ 
                    animationDelay: `${idx * 0.04}s`,
                    color: idx >= 4 ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  {char}
                </span>
              ))}
            </h2>
          </div>
          <p className="auth-subtitle">
            Log in to access B.Tech notes & papers
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button 
            type="button" 
            className="auth-google-btn" 
            onClick={() => handleOAuthLogin('Google')}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7l2.8 2.17c1.63-1.5 2.8-3.7 2.8-6.5z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.8-2.17c-.78.52-1.78.83-2.96.83-2.28 0-4.2-1.54-4.9-3.61L1.4 13.06C2.9 16.03 6 18 9 18z"/>
              <path fill="#FBBC05" d="M4.1 10.85c-.18-.53-.28-1.1-.28-1.68s.1-1.15.28-1.68L1.4 5.34C.5 7.15 0 9.17 0 11.25s.5 4.1 1.4 5.91l2.7-2.31z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.47.89 11.43 0 9 0 6 0 2.9 1.97 1.4 4.94l2.7 2.31c.7-2.07 2.62-3.67 4.9-3.67z"/>
            </svg>
            Sign in with Google
          </button>
          
          <button 
            type="button" 
            className="auth-google-btn" 
            onClick={() => handleOAuthLogin('Microsoft')}
            disabled={loading}
            style={{ width: '100%' }}
          >
            <svg width="18" height="18" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
