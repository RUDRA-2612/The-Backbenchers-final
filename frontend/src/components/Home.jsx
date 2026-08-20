import React, { useState } from 'react';
import SubjectGrid from './SubjectGrid';

const years = [
  {
    title: 'First Year',
    semesters: [
      { num: 1, label: 'Semester 1' },
      { num: 2, label: 'Semester 2' }
    ]
  },
  {
    title: 'Second Year',
    semesters: [
      { num: 3, label: 'Semester 3' },
      { num: 4, label: 'Semester 4' }
    ]
  },
  {
    title: 'Third Year',
    semesters: [
      { num: 5, label: 'Semester 5' },
      { num: 6, label: 'Semester 6' }
    ]
  },
  {
    title: 'Fourth Year',
    semesters: [
      { num: 7, label: 'Semester 7' },
      { num: 8, label: 'Semester 8' }
    ]
  }
];

export default function Home({ onSelectSubject }) {
  const [activeSemester, setActiveSemester] = useState(null);

  if (activeSemester) {
    return (
      <SubjectGrid 
        activeSemester={activeSemester} 
        onSelectSubject={onSelectSubject} 
        onBack={() => setActiveSemester(null)} 
      />
    );
  }

  return (
    <div>
      <div className="hero-section">
        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.45em', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1' }}>Welcome to</span>
          <span className="hero-brand-name">
            {"Backbenchers".split('').map((char, idx) => (
              <span 
                key={idx} 
                className="dance-letter" 
                style={{ 
                  animationDelay: `${idx * 0.04}s`,
                  color: idx >= 4 ? 'var(--accent)' : 'var(--text-primary)'
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-subtitle">Select your year and semester to find notes, PYQs, solutions, formula sheets, and important exam topics.</p>
      </div>

      <div className="year-grid">
        {years.map((year, idx) => (
          <div key={idx} className="year-card">
            <h2 className="year-title">{year.title}</h2>
            <div className="semester-buttons">
              {year.semesters.map((sem) => (
                <button 
                  key={sem.num} 
                  className="semester-btn"
                  onClick={() => setActiveSemester(sem.num)}
                >
                  {sem.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
