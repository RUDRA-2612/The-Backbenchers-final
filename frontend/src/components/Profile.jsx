import React, { useState } from 'react';
import { User, Mail, Key, Shield, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

export default function Profile({ user }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('New password must be at least 6 characters long');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to change password');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>Your <span>Profile</span></h1>
        <p className="hero-subtitle">Manage your account details and security</p>
      </div>

      <div className="auth-card" style={{ maxWidth: '100%', animation: 'none', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="profile-avatar" style={{ width: '64px', height: '64px', fontSize: '1.8rem', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)', fontWeight: '700' }}>
            {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'S'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            {user.isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.25rem' }}>
                <Shield size={14} /> Administrator
              </div>
            )}
          </div>
        </div>

        {!user.isGoogle ? (
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} autoComplete="off">
            {/* Dummy hidden inputs to trap aggressive browser autofill */}
            <div style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute', top: '-9999px', zIndex: -1 }}>
              <input type="text" name="fake_email_trap" tabIndex="-1" autoComplete="username" />
              <input type="password" name="fake_password_trap" tabIndex="-1" autoComplete="current-password" />
            </div>
            
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              <Key size={18} style={{ color: 'var(--accent)' }} /> Change Password
            </h3>

            {status === 'success' && (
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> {message}
              </div>
            )}

            {status === 'error' && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} /> {message}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  className="form-input" 
                  style={{ paddingRight: '40px' }}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  className="form-input" 
                  style={{ paddingRight: '40px' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="form-input" 
                  style={{ paddingRight: '40px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <AlertCircle size={20} />
            <p>You are logged in with Google. Password changes are disabled for Google accounts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
