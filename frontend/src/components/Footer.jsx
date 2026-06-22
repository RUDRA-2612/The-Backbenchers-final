import React from 'react';
import { Heart, Linkedin } from 'lucide-react';

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
              <Linkedin size={12} /> LinkedIn
            </a>
          </li>
          <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>Shubh Dixit <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></span>
            <a href="https://www.linkedin.com/in/shubhdixit0912/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: '12px' }}>
              <Linkedin size={12} /> LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Backbenchers Portal. All rights reserved.</p>
    </footer>
  );
}
