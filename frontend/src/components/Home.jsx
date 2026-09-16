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
    branches: [
      { id: 'core', label: 'Core' },
      { id: 'ai', label: 'AI' }
    ]
  },
  {
    title: 'Fourth Year',
    subtitle: 'The Finale: Focus on major projects, advanced electives, and preparing for the industry.',
    branches: [
      { id: 'core', label: 'Core' },
      { id: 'ai', label: 'AI' }
    ]
  }
];

export default function Home({ onSelectSubject, lastOpenedFile, onViewFile }) {
  return (
    <div style={{ position: 'relative' }}>
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
        <p className="hero-subtitle">Built by the students, for the students.</p>
      </div>

      <div className="year-grid">
        {years.map((year, idx) => (
          <div key={idx} className="year-card">
            <div className="year-header">
              <h2 className="year-title">{year.title}</h2>
              <p className="year-subtitle">{year.subtitle}</p>
            </div>
            {year.branches ? (
              <div className="semester-buttons">
                {year.branches.map((branch) => (
                  <button 
                    key={branch.id}
                    className="semester-btn"
                    onClick={() => { window.location.hash = `year-${idx + 1}-${branch.id}`; }}
                  >
                    {branch.label}
                  </button>
                ))}
              </div>
            ) : year.action ? (
              <div className="semester-buttons">
                <button 
                  className="semester-btn"
                  style={{ width: '100%' }}
                  onClick={() => { window.location.hash = year.action.hash; }}
                >
                  {year.action.label}
                </button>
              </div>
            ) : (
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
            )}
          </div>
        ))}
      </div>

      {lastOpenedFile && (
        <div className="continue-studying-banner">
          <div className="continue-studying-info">
            <h3 className="continue-banner-title">Continue Studying</h3>
            <p className="continue-banner-subtitle">
              <strong>{lastOpenedFile.title}</strong>
              {lastOpenedFile.lastOpenedAt && (
                <span className="continue-date">
                  Last opened: {new Date(lastOpenedFile.lastOpenedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              )}
            </p>
          </div>
          <button 
            className="continue-banner-btn"
            onClick={() => onViewFile(lastOpenedFile)}
          >
            <Clock size={16} />
            Open
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '3rem auto 1rem', padding: '0 2rem', maxWidth: '600px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
        <p>Check back regularly! We are continuously uploading new study materials and resources.</p>
      </div>
    </div>
  );
}
