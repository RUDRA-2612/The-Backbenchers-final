import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src="/logo.png" alt="Logo" className="nav-logo-img" style={{ height: '100px' }} />
      </div>
      <div className="footer-admins">
        <span className="footer-admins-title">Website Crafted with <Heart size={14} fill="var(--accent)" color="var(--accent)" style={{ display: 'inline', verticalAlign: 'middle' }} /> by:</span>
        <ul className="footer-admins-list" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Rudrapal Singh Shekhawat <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>(2nd Year)</span></span>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <a href="https://www.linkedin.com/in/rudrapal-singh-shekhawat-5a57a2377" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', background: 'var(--accent-soft)', padding: '4px 8px', borderRadius: '12px', transition: 'all 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#0A66C2"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm15.11 13.02h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/></svg> LinkedIn
              </a>
              <a href="https://www.instagram.com/back_benchers_26_/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#E1306C', textDecoration: 'none', background: 'rgba(225, 48, 108, 0.1)', padding: '4px 8px', borderRadius: '12px', transition: 'all 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> Instagram
              </a>
            </div>
          </li>

        </ul>
      </div>
      
      <div className="seo-footer-text" style={{ textAlign: 'center', maxWidth: '800px', margin: '20px auto', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        <p><strong><span style={{ color: 'var(--text-primary)' }}>Back</span><span style={{ color: 'var(--accent)' }}>benchers</span></strong> is the premier study portal for <strong>JK Lakshmipat University (JKLU)</strong>, providing <strong>Previous year question papers (PYQs)</strong>, study material, handwritten notes, and exam resources to help you ace your semester exams.</p>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Backbenchers Portal. All rights reserved.</p>
    </footer>
  );
}
