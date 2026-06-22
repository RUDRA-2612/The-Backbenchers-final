import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src="/logo.png" alt="Logo" className="nav-logo-img" style={{ height: '54px' }} />
      </div>
      <div className="footer-admins">
        <span className="footer-admins-title">Website Crafted with <Heart size={14} fill="var(--accent)" color="var(--accent)" style={{ display: 'inline', verticalAlign: 'middle' }} /> by:</span>
        <ul className="footer-admins-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>Rudrapal Singh Shekhawat <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></span>
            <a href="https://www.linkedin.com/in/rudrapal-singh-shekhawat-5a57a2377" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
            </a>
          </li>
          <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>Shubh Dixit <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></span>
            <a href="https://www.linkedin.com/in/shubhdixit0912/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Backbenchers Portal. All rights reserved.</p>
    </footer>
  );
}
