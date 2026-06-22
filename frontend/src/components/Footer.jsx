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
        <ul className="footer-admins-list">
          <li>Rudrapal Singh Shekhawat <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></li>
          <li>Shubh Dixit <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></li>
        </ul>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Backbenchers Portal. All rights reserved.</p>
    </footer>
  );
}
