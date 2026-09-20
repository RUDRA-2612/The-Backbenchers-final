import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';
import { API_URL } from '../config';

export default function Auth({ onLoginSuccess }) {
  const { instance, inProgress, accounts } = useMsal();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loginInProgressRef = React.useRef(false);

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
      if (inProgress === 'none' && accounts.length > 0 && !loginInProgressRef.current) {
        loginInProgressRef.current = true;
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
        } finally {
          setLoading(false);
          // We do NOT reset loginInProgressRef.current here because if it succeeds, Auth unmounts.
          if (error) {
             loginInProgressRef.current = false;
          }
        }
      }
    };

    processBackendLogin();
  }, [inProgress, accounts, instance, onLoginSuccess]);

  const handleMicrosoftLogin = async () => {
    setError('');
    setLoading(true);
    try {
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

        {error && (
          <div className="auth-error">
            {error}
            {error.includes("Rudrapal") && (
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center' }}>
                <a 
                  href="https://wa.me/917737472264" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#25D366',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contact on WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

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
