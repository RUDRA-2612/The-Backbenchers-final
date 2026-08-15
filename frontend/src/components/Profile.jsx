import React from 'react';
import { Mail, Shield } from 'lucide-react';

export default function Profile({ user }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>Your <span>Profile</span></h1>
        <p className="hero-subtitle">Manage your account details</p>
      </div>

      <div className="auth-card" style={{ maxWidth: '100%', animation: 'none', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
      </div>
    </div>
  );
}
