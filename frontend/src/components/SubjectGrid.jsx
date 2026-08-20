import React from 'react';
import { ArrowRight, ArrowLeft, Frown, Book } from 'lucide-react';
import { masterSubjects } from '../data/subjects';

export default function SubjectGrid({ activeSemester = 1, onSelectSubject, onBack }) {
  let displaySubjects = [];
  
  // Find the semester in masterSubjects
  Object.values(masterSubjects).forEach(year => {
    if (year.semesters[activeSemester]) {
      displaySubjects = year.semesters[activeSemester];
    }
  });

  return (
    <div>
      {onBack && (
        <button 
          onClick={onBack}
          className="back-btn"
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={20} /> Back
        </button>
      )}
      <div className="hero-section" style={{ position: 'relative' }}>
        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.45em', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1' }}>Subjects for</span>
          <span className="hero-brand-name" style={{ fontSize: '1.2em' }}>Semester {activeSemester}</span>
        </h1>
        <p className="hero-subtitle">Explore notes, PYQs, solutions, and important exam topics for Semester {activeSemester}.</p>
      </div>

      {displaySubjects.length > 0 ? (
        <div className="subjects-grid">
          {displaySubjects.map((sub) => {
            const IconComponent = sub.icon;
          return (
            <div 
              key={sub.code} 
              className="subject-card"
              onClick={() => onSelectSubject(sub)}
            >
              <div className="subject-card-header">
                <span className="subject-code">{sub.code}</span>
                <h3 className="subject-title">{sub.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{sub.desc}</p>
              </div>
              <div className="subject-card-footer">
                <span>View Study Materials <ArrowRight size={16} /></span>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <Book size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2>Coming Soon</h2>
          <p>Subjects for Semester {activeSemester} will be added shortly. Stay tuned!</p>
        </div>
      )}
    </div>
  );
}
