import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';
import { API_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const { instance, inProgress, accounts } = useMsal();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If MSAL is already processing a login (e.g. returning from redirect), show loading state
  useEffect(() => {
    if (inProgress === 'login' || inProgress === 'handleRedirect') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [inProgress]);

  useEffect(() => {
    const processBackendLogin = async () => {
      // If MSAL has finished its work and we have a logged-in account, proceed with our backend auth
      if (inProgress === 'none' && accounts.length > 0) {
        setLoading(true);
        try {
          const account = accounts[0];
          const email = account.username || '';
          const name = account.name || 'JKLU Student';
          const microsoftAccountId = account.localAccountId;

          // Validate domain
          if (!email.toLowerCase().endsWith('@jklu.edu.in')) {
            throw new Error('Access restricted to @jklu.edu.in accounts only.');
          }

          // Register/Login to our backend
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              name: name,
              provider: 'Microsoft',
              microsoftAccountId: microsoftAccountId
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to authenticate with backend.');
          }

          onLoginSuccess(data.user);
        } catch (err) {
          console.error("Backend Login Error:", err);
          setError(err.message || 'An error occurred during login. Please try again.');
          // Removed automatic logoutRedirect here so the user can actually read the error message.
        } finally {
          setLoading(false);
        }
      }
    };

    processBackendLogin();
  }, [inProgress, accounts, instance, onLoginSuccess]);

  const handleMicrosoftLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use redirect instead of popup to avoid browser blocks
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'An error occurred starting login.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <img src="/logo.png" alt="Logo" className="smart-logo" style={{ height: '160px', width: 'auto', objectFit: 'contain' }} />
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
            onClick={handleMicrosoftLogin}
            disabled={loading || inProgress !== 'none'}
            style={{ width: '100%' }}
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Sign in with JKLU Microsoft Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
