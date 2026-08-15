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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#0A66C2"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm15.11 13.02h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/></svg> LinkedIn
            </a>
          </li>
          <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>Shubh Dixit <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(2nd Year)</span></span>
            <a href="https://www.linkedin.com/in/shubhdixit0912/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: '12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#0A66C2"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm15.11 13.02h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/></svg> LinkedIn
            </a>
          </li>
        </ul>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Backbenchers Portal. All rights reserved.</p>
    </footer>
  );
}
