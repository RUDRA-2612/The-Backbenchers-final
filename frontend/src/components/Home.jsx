import React, { useState } from 'react';
import SubjectGrid from './SubjectGrid';
import { Clock } from 'lucide-react';

const years = [
  {
    title: 'First Year',
    subtitle: 'The Foundation: Start your engineering journey with core concepts and basic sciences.',
    semesters: [
      { num: 1, label: 'Semester 1' },
      { num: 2, label: 'Semester 2' }
    ]
  },
  {
    title: 'Second Year',
    subtitle: 'The Core: Dive deeper into your specialization with fundamental engineering subjects.',
    semesters: [
      { num: 3, label: 'Semester 3' },
      { num: 4, label: 'Semester 4' }
    ]
  },
  {
    title: 'Third Year',
    subtitle: 'The Advancement: Master complex topics and start applying your knowledge to real-world problems.',
    semesters: [
      { num: 5, label: 'Semester 5' },
      { num: 6, label: 'Semester 6' }
    ]
  },
  {
    title: 'Fourth Year',
    subtitle: 'The Finale: Focus on major projects, advanced electives, and preparing for the industry.',
    semesters: [
      { num: 7, label: 'Semester 7' },
      { num: 8, label: 'Semester 8' }
    ]
  }
];

export default function Home({ onSelectSubject, lastOpenedFile, onViewFile }) {
  return (
    <div style={{ position: 'relative' }}>
      {lastOpenedFile && (
        <div className="continue-studying-wrapper">
          <div 
            className="continue-studying-card"
            onClick={() => onViewFile(lastOpenedFile)}
            title="Continue your last session"
          >
            <div className="continue-icon">
              <Clock size={18} />
            </div>
            <div className="continue-content">
              <span className="continue-label">Continue Studying</span>
              <span className="continue-title" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {lastOpenedFile.title}
              </span>
            </div>
          </div>
        </div>
      )}
      
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
        <p className="hero-subtitle">Your ultimate B.Tech companion. Find notes, PYQs, solutions, and exam topics for all 4 years of your engineering journey.</p>
      </div>

      <div className="year-grid">
        {years.map((year, idx) => (
          <div key={idx} className="year-card">
            <div className="year-header">
              <h2 className="year-title">{year.title}</h2>
              <p className="year-subtitle">{year.subtitle}</p>
            </div>
            <div className="semester-buttons">
              {year.semesters.map((sem) => (
                <button 
                  key={sem.num} 
                  className="semester-btn"
                  onClick={() => { window.location.hash = 'semester-' + sem.num; }}
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
