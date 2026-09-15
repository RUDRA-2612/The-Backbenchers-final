import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Code2, BookOpen, User, Linkedin, Instagram } from 'lucide-react';

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
      instagram: 'https://www.instagram.com/_rdrsh_/'
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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {contributor.linkedin && (
                    <a 
                      href={contributor.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ transition: 'transform 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={`Connect with ${contributor.name} on LinkedIn`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
                        <rect width="24" height="24" rx="4" fill="#0A66C2"/>
                        <path fill="#FFF" d="M20.45 20.45h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66H9.35V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
                      </svg>
                    </a>
                  )}
                  {contributor.instagram && (
                    <a 
                      href={contributor.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ transition: 'transform 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={`Connect with ${contributor.name} on Instagram`}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="insta-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                          </linearGradient>
                        </defs>
                        <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#insta-grad)" />
                        <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7ZM12 15.2C10.2327 15.2 8.8 13.7673 8.8 12C8.8 10.2327 10.2327 8.8 12 8.8C13.7673 8.8 15.2 10.2327 15.2 12C15.2 13.7673 13.7673 15.2 12 15.2Z" fill="white"/>
                        <circle cx="17.5" cy="6.5" r="1.3" fill="white"/>
                        <rect x="4.5" y="4.5" width="15" height="15" rx="3.5" stroke="white" strokeWidth="1.8"/>
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
