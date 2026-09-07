import React from 'react';
import { createPortal } from 'react-dom';
import { X, Code2, BookOpen, ExternalLink, User } from 'lucide-react';

export default function CreditsModal({ onClose }) {
  const contributors = [
    {
      name: 'Aman Jhajharia',
      year: 'Final Year',
      image: '/aman.jpeg',
      roles: [
        { title: 'Content Lead', icon: <BookOpen size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aman-jhajharia/'
    },
    {
      name: 'Aahan Bansal',
      year: 'Final Year',
      image: '/aahan.jpeg',
      imagePosition: 'center 10%',
      roles: [
        { title: 'Content Lead', icon: <BookOpen size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aahan-bansal-0a2954351/'
    },
    {
      name: 'Rudrapal Singh Shekhawat',
      year: '2nd Year',
      image: '',
      roles: [
        { title: 'Web Developer', icon: <Code2 size={14} /> },
        { title: '1st Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/rudrapal-singh-shekhawat-5a57a2377'
    }
  ];

  const modalContent = (
    <div className="modal-overlay credits-overlay" onClick={onClose}>
      <div className="credits-modal-content" onClick={e => e.stopPropagation()}>
        <div className="credits-header">
          <h2>Project Credits</h2>
          <button className="credits-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <p className="credits-subtitle">Meet the visionary team behind the Backbenchers Portal</p>
        
        <div className="credits-grid">
          {contributors.map((contributor, index) => (
            <div key={index} className="credit-card">
              <div className="credit-card-top">
                <div className="credit-avatar" style={{ overflow: 'hidden', padding: contributor.image ? 0 : undefined }}>
                  {contributor.image ? (
                    <img src={contributor.image} alt={contributor.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: contributor.imagePosition || 'center' }} />
                  ) : (
                    <User size={24} color="var(--accent)" />
                  )}
                </div>
                <a 
                  href={contributor.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="linkedin-icon-link"
                  title={`Connect with ${contributor.name} on LinkedIn`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm15.11 13.02h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                  </svg>
                </a>
              </div>
              <div className="credit-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0 }}>{contributor.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {contributor.year}
                </span>
              </div>
              <div className="credit-roles">
                {contributor.roles.map((role, rIndex) => (
                  <span key={rIndex} className={`role-badge ${rIndex === 0 ? 'role-primary' : 'role-secondary'}`}>
                    {role.icon} {role.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
