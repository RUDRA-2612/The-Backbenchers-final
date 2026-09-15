import React from 'react';
import { ArrowRight, ArrowLeft, Frown, Book } from 'lucide-react';
import { masterSubjects, getSemesterForSubject } from '../data/subjects';

export default function SubjectGrid({ activeSemester, activeYear, activeBranch, onSelectSubject, onBack }) {
  let displaySubjects = [];
  let title = '';
  let subtitle = '';
  
  if (activeSemester) {
    Object.values(masterSubjects).forEach(year => {
      if (year.semesters && year.semesters[activeSemester]) {
        displaySubjects = year.semesters[activeSemester];
      }
    });
    title = `Semester ${activeSemester}`;
    subtitle = `Explore notes, PYQs, and important exam topics for Semester ${activeSemester}.`;
  } else if (activeYear) {
    const yearKey = `year${activeYear}`;
    if (masterSubjects[yearKey]) {
      if (activeBranch && masterSubjects[yearKey].branches && masterSubjects[yearKey].branches[activeBranch]) {
        displaySubjects = masterSubjects[yearKey].branches[activeBranch];
        title = activeYear === 3 ? `Third Year (${activeBranch.toUpperCase()})` : `Fourth Year (${activeBranch.toUpperCase()})`;
      } else {
        // Fallback if no active branch (should not hit normally, but safe to have)
        Object.values(masterSubjects[yearKey].semesters || {}).forEach(semSubs => {
          if (semSubs && semSubs.length > 0) {
            displaySubjects.push(...semSubs);
          }
        });
        title = activeYear === 3 ? 'Third Year' : 'Fourth Year';
      }
    }
    subtitle = `Explore notes, PYQs, and important exam topics for ${title}.`;
  }

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
          <span className="hero-brand-name" style={{ fontSize: '1.2em' }}>{title}</span>
        </h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>

      {displaySubjects.length > 0 ? (
        <div className="subjects-grid">
          {displaySubjects.map((sub) => {
            const IconComponent = sub.icon;
          return (
            <div 
              key={sub.code} 
              className="subject-card"
              onClick={() => {
                const sem = activeSemester || getSemesterForSubject(sub.code);
                onSelectSubject({ ...sub, semester: sem });
              }}
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
          <p>Subjects for {title} will be added shortly. Stay tuned!</p>
        </div>
      )}
    </div>
  );
}
