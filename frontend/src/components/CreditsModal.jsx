import React from 'react';
import { X, Code, BookOpen } from 'lucide-react';

export default function CreditsModal({ onClose }) {
  const contributors = [
    {
      name: 'Aman Jhajharia',
      roles: [
        { title: 'Core Developer', icon: <Code size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aman-jhajharia/'
    },
    {
      name: 'Aahan Bansal',
      roles: [
        { title: 'Core Developer', icon: <Code size={14} /> },
        { title: '2nd & 3rd Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/aahan-bansal-0a2954351/'
    },
    {
      name: 'Rudrapal Singh Shekhawat',
      roles: [
        { title: 'Core Developer', icon: <Code size={14} /> },
        { title: '1st Year Content', icon: <BookOpen size={14} /> }
      ],
      linkedin: 'https://www.linkedin.com/in/rudrapal-singh-shekhawat-5a57a2377'
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="credits-modal-content" onClick={e => e.stopPropagation()}>
        <div className="credits-header">
          <h2>Project Credits</h2>
          <button className="credits-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <p className="credits-subtitle">Meet the team behind the Backbenchers Portal</p>
        
        <div className="credits-grid">
          {contributors.map((contributor, index) => (
            <div key={index} className="credit-card">
              <div className="credit-card-header">
                <h3>{contributor.name}</h3>
              </div>
              <div className="credit-roles">
                {contributor.roles.map((role, rIndex) => (
                  <span key={rIndex} className="role-badge">
                    {role.icon} {role.title}
                  </span>
                ))}
              </div>
              <a 
                href={contributor.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="linkedin-link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm15.11 13.02h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.93v5.66h-3.56V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                </svg> 
                Connect on LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
