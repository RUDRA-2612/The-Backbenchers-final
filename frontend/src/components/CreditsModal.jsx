import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Code2, BookOpen, User } from 'lucide-react';

export default function CreditsModal({ onClose }) {
  const contributors = [
    {
      name: 'Rudrapal Singh Shekhawat',
      year: '2nd Year',
      image: '/rudra_4.png',
      nameClass: 'name-rudra',
      roles: [
        { title: 'Web Developer', icon: <Code2 size={14} /> },
        { title: 'Content Contributor', icon: <BookOpen size={14} /> },
        { title: '1st & 2nd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/rudrapal-singh-shekhawat-5a57a2377',
      instagram: 'https://instagram.com/_rdrsh_'
    },
    {
      name: 'Aman Jhajharia',
      year: 'Final Year',
      image: '/aman.jpeg',
      nameClass: 'name-content-lead',
      roles: [
        { title: 'Content Lead', icon: <BookOpen size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aman-jhajharia/'
    },
    {
      name: 'Aahan Bansal',
      year: 'Final Year',
      image: '/aahan_1.jpeg',
      imagePosition: 'center 10%',
      nameClass: 'name-content-lead',
      roles: [
        { title: 'Content Lead', icon: <BookOpen size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aahan-bansal-0a2954351/'
    },
    {
      name: 'Raghuraj Singh Shekhawat',
      year: '2nd Year',
      image: '/raghu_1.jpeg',
      nameClass: 'name-raghuraj',
      roles: [
        { title: 'Content Contributor', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/raghuraj-singh-shekhawat-6a9b4b37b/'
    }
  ];

  // Lock background scroll when credits is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Handle back button — navigate to #credits so popstate closes it
  useEffect(() => {
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const modalContent = (
    <div className="modal-overlay credits-overlay" onClick={onClose}>
      <div className="credits-modal-content" onClick={e => e.stopPropagation()}>
        <div className="credits-header">
          <h2>Credits</h2>
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {contributor.linkedin && (
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
                  )}
                  {contributor.instagram && (
                    <a 
                      href={contributor.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="instagram-icon-link"
                      title={`Connect with ${contributor.name} on Instagram`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <div className="credit-card-header" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0 }} className={contributor.nameClass || ''}>{contributor.name}</h3>
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
