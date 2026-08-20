import React from 'react';
import { Terminal, Zap, Calculator, Leaf, Radio, Cpu, ArrowRight, Book, Frown, Code, Atom, ArrowLeft } from 'lucide-react';

const subjects = [
  { name: 'Programming 1 (Python)', code: 'CS1139', icon: Terminal, desc: 'Introductory programming, control flow, functions, lists, and file handling.' },
  { name: 'Electrical and Electronics Engineering (EEE)', code: 'EE1118', icon: Cpu, desc: 'DC circuits, KVL/KCL, network theorems, AC circuits, and semiconductor diodes.' },
  { name: 'Calculus', code: 'AS1109', icon: Calculator, desc: 'Limits, continuity, single variable differentiation, integration, and infinite series.' },
  { name: 'Applied Physics', code: 'AS1108', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
  { name: 'Environmental Science and Sustainability', code: 'ES1115', icon: Leaf, desc: 'Ecosystems, biodiversity, pollution control, global warming, and sustainable dev.' },
  { name: 'Fundamental of Communication', code: 'CC1101', icon: Radio, desc: 'Basics of signals, modulation techniques (AM/FM), and data transmission systems.' },
  { name: 'Introduction to Indian Knowledge System (IKS)', code: 'IL1107', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
];

export default function SubjectGrid({ activeSemester = 1, onSelectSubject, onBack }) {
  // Currently we only have data for semester 1
  const displaySubjects = activeSemester === 1 ? subjects : [];

  return (
    <div>
      <div className="hero-section" style={{ position: 'relative' }}>
        {onBack && (
          <button 
            onClick={onBack}
            className="back-btn"
            style={{ position: 'absolute', top: 0, left: 0, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}
          >
            <ArrowLeft size={20} /> Back
          </button>
        )}
        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.45em', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1' }}>Semester {activeSemester}</span>
          <span className="hero-brand-name" style={{ fontSize: '1.2em' }}>Subjects</span>
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
