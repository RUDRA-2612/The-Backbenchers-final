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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {contributor.linkedin && (
                    <a 
                      href={contributor.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="linkedin-icon-link"
                      title={`Connect with ${contributor.name} on LinkedIn`}
                    >
                      <Linkedin size={18} strokeWidth={2} />
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
                      <Instagram size={18} strokeWidth={2} />
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
