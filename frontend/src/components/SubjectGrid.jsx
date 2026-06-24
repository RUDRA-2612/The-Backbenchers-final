import React from 'react';
import { Terminal, Zap, Calculator, Leaf, Radio, Cpu, ArrowRight, Book } from 'lucide-react';

const subjects = [
  { name: 'Programming 1 (Python)', code: 'CS1139', icon: Terminal, desc: 'Introductory programming, control flow, functions, lists, and file handling.' },
  { name: 'Electrical and Electronics Engineering (EEE)', code: 'EE1118', icon: Cpu, desc: 'DC circuits, KVL/KCL, network theorems, AC circuits, and semiconductor diodes.' },
  { name: 'Calculus', code: 'AS1109', icon: Calculator, desc: 'Limits, continuity, single variable differentiation, integration, and infinite series.' },
  { name: 'Applied Physics', code: 'AS1108', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
  { name: 'Environmental Science and Sustainability', code: 'ES1115', icon: Leaf, desc: 'Ecosystems, biodiversity, pollution control, global warming, and sustainable dev.' },
  { name: 'Fundamental of Communication', code: 'CC1101', icon: Radio, desc: 'Basics of signals, modulation techniques (AM/FM), and data transmission systems.' },
  { name: 'Introduction to Indian Knowledge System (IKS)', code: 'IL1107', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
];

export default function SubjectGrid({ onSelectSubject }) {
  return (
    <div>
      <div className="hero-section">
        <h1 className="hero-title">Welcome to <span>Backbenchers</span></h1>
        <p className="hero-subtitle">Your ultimate portal for 1st-semester notes, PYQs, solutions, formula sheets, and important exam topics.</p>
      </div>

      <div className="subjects-grid">
        {subjects.map((sub) => {
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
    </div>
  );
}
