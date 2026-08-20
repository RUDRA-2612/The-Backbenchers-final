import React from 'react';
import { Terminal, Zap, Calculator, Leaf, Radio, Cpu, ArrowRight, Book, Frown, Code, Atom, ArrowLeft, Database, Activity } from 'lucide-react';

const semester1Subjects = [
  { name: 'Programming 1 (Python)', code: 'CS1139', icon: Terminal, desc: 'Introductory programming, control flow, functions, lists, and file handling.' },
  { name: 'Electrical and Electronics Engineering (EEE)', code: 'EE1118', icon: Cpu, desc: 'DC circuits, KVL/KCL, network theorems, AC circuits, and semiconductor diodes.' },
  { name: 'Calculus', code: 'AS1109', icon: Calculator, desc: 'Limits, continuity, single variable differentiation, integration, and infinite series.' },
  { name: 'Applied Physics', code: 'AS1108', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
  { name: 'Environmental Science and Sustainability', code: 'ES1115', icon: Leaf, desc: 'Ecosystems, biodiversity, pollution control, global warming, and sustainable dev.' },
  { name: 'Fundamental of Communication', code: 'CC1101', icon: Radio, desc: 'Basics of signals, modulation techniques (AM/FM), and data transmission systems.' },
  { name: 'Introduction to Indian Knowledge System (IKS)', code: 'IL1107', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
];

const semester2Subjects = [
  { name: 'Programming 2 (C)', code: 'CS1135', icon: Code, desc: 'Advanced programming in C, pointers, memory management, and data structures.' },
  { name: 'Digital Electronics', code: 'EE1125', icon: Cpu, desc: 'Logic gates, Boolean algebra, combinational and sequential circuits, and microprocessors.' },
  { name: 'Linear Algebra and Differential Equations', code: 'AS1114', icon: Calculator, desc: 'Matrices, vector spaces, eigenvalues, and ordinary differential equations.' },
  { name: 'Critical Thinking and Storytelling', code: 'CC1102', icon: Book, desc: 'Developing critical thinking skills and the art of effective storytelling.' },
  { name: 'Applied Physics', code: 'AS1108', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
  { name: 'Introduction to Indian Knowledge System (IKS)', code: 'IL1107', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
];

const semester3Subjects = [
  { name: 'Data Structure and Algorithms', code: 'CS1131', icon: Code, desc: 'Advanced data structures, algorithm analysis, and problem-solving techniques.' },
  { name: 'Computer Organization and Architecture', code: 'CS1134', icon: Cpu, desc: 'Computer architecture, memory hierarchy, CPU design, and instruction sets.' },
  { name: 'Database Management Systems', code: 'CS1133', icon: Database, desc: 'Relational databases, SQL, normal forms, and transaction management.' },
  { name: 'Discrete Mathematics', code: 'CS1141', icon: Calculator, desc: 'Logic, sets, relations, functions, graphs, and combinatorial mathematics.' },
  { name: 'Essentials of Business Management', code: 'LS1108', icon: Book, desc: 'Fundamental concepts of business operations, management, and strategy.' },
  { name: 'Perspectives on Contemporary Issues', code: 'CC1103', icon: Radio, desc: 'Analyzing and discussing modern societal, ethical, and global challenges.' }
];

const semester4Subjects = [
  { name: 'Design and Analysis of Algorithms', code: 'CS1105', icon: Code, desc: 'Algorithm design paradigms, complexity classes, and advanced graph algorithms.' },
  { name: 'Machine Learning', code: 'CS1138', icon: Atom, desc: 'Supervised and unsupervised learning, neural networks, and predictive modeling.' },
  { name: 'Operating Systems', code: 'CS1108', icon: Terminal, desc: 'Process management, memory management, file systems, and concurrency.' },
  { name: 'Probability and Statistics', code: 'AS2170', icon: Activity, desc: 'Probability distributions, statistical inference, hypothesis testing, and regression.' },
  { name: 'Managing Business Functions', code: 'LS1109', icon: Book, desc: 'Deep dive into marketing, finance, human resources, and operations management.' },
  { name: 'Communication and Identity', code: 'CC1104', icon: Radio, desc: 'Understanding personal and professional identity through effective communication.' }
];

export default function SubjectGrid({ activeSemester = 1, onSelectSubject, onBack }) {
  let displaySubjects = [];
  if (activeSemester === 1) displaySubjects = semester1Subjects;
  else if (activeSemester === 2) displaySubjects = semester2Subjects;
  else if (activeSemester === 3) displaySubjects = semester3Subjects;
  else if (activeSemester === 4) displaySubjects = semester4Subjects;

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
