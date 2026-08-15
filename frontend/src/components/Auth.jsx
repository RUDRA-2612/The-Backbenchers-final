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
