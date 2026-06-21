import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function MockPdfViewer({ file, onClose, onDownload }) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = file.category === 'papers' ? 3 : 2;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 70));

  // Generates subject/category specific styled academic contents
  const renderPdfContent = () => {
    const code = file.subjectCode;
    const cat = file.category;

    if (cat === 'papers') {
      const term = file.subcategory === 'end-term' ? 'End Term' : file.subcategory === 'mid-term-2' ? 'Mid Term 2' : 'Mid Term 1';
      return (
        <div className="pdf-page-sheet">
          <div className="pdf-sheet-header">
            <span className="pdf-sheet-logo"><img src="/logo.png" alt="Logo" className="pdf-logo-img" /> Exams</span>
            <span className="pdf-sheet-subcode">{code}</span>
          </div>
          <h2 className="pdf-sheet-title">{file.title}</h2>
          <div className="pdf-sheet-meta">
            <span><strong>Course:</strong> B.Tech 1st Year</span>
            <span><strong>Term:</strong> {term}</span>
            <span><strong>Marks:</strong> {file.subcategory === 'end-term' ? '100' : '50'}</span>
          </div>

          <div className="pdf-section">
            <div className="pdf-section-heading">Section A (Short Answer Questions)</div>
            <div className="pdf-question-block">
              <div className="pdf-question-title">Q1. State the primary laws or core concepts applicable to this module. (5 Marks)</div>
              <p className="pdf-section-p">
                <em>Model Answer:</em> Refer to course lecture notes. For engineering courses, ensure formulas are written along with SI units. State assumptions clearly before drawing circuit diagrams or writing code blocks.
              </p>
              <div className="pdf-solution-title">✓ Verified Solution Provided Online</div>
            </div>
            <div className="pdf-question-block">
              <div className="pdf-question-title">Q2. Solve the fundamental differential equation or evaluate system response. (5 Marks)</div>
              <p className="pdf-section-p">
                <em>Model Answer:</em> Apply standard boundary conditions. Check units and scale constants.
              </p>
            </div>
          </div>

          <div className="pdf-section">
            <div className="pdf-section-heading">Section B (Long Answer & Practical Problems)</div>
            <div className="pdf-question-block">
              <div className="pdf-question-title">Q3. Design or optimize the given parameters for maximum efficiency. (15 Marks)</div>
              <p className="pdf-section-p">
                <em>Model Answer:</em> Derive from first principles, draw the neat schematic diagram, write out the governing equations, and calculate step-by-step to arrive at the final solution.
              </p>
              <div className="pdf-solution-title">✓ Solved step-by-step inside the sheet</div>
            </div>
          </div>

          <div className="pdf-sheet-footer">
            Page {page} of {totalPages} | Backbenchers Exam Series 2026
          </div>
        </div>
      );
    }

    if (cat === 'formulas') {
      return (
        <div className="pdf-page-sheet">
          <div className="pdf-sheet-header">
            <span className="pdf-sheet-logo"><img src="/logo.png" alt="Logo" className="pdf-logo-img" /> Quick Sheets</span>
            <span className="pdf-sheet-subcode">{code}</span>
          </div>
          <h2 className="pdf-sheet-title">{file.title}</h2>
          <div className="pdf-sheet-meta">
            <span><strong>Type:</strong> Formula Sheet</span>
            <span><strong>Semester:</strong> 1st Semester</span>
          </div>

          <div className="pdf-section">
            <div className="pdf-section-heading">Core Equations & Constant Tables</div>
            <p className="pdf-section-p">Below are the highly repeated formulas from previous year exams for quick revision:</p>
            
            <div className="pdf-question-block" style={{ borderLeftColor: '#10b981' }}>
              <div className="pdf-question-title">Equation 1: General Governing Relationship</div>
              <p className="pdf-section-p" style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.05rem', color: 'var(--accent)' }}>
                Y(x) = ∫ [ f(t) * e^(-iωt) ] dt  from -∞ to +∞
              </p>
              <p className="pdf-section-p">Where f(t) represents the input excitation and Y(x) represents the spectrum distribution coefficient.</p>
            </div>

            <div className="pdf-question-block" style={{ borderLeftColor: '#10b981' }}>
              <div className="pdf-question-title">Equation 2: System Boundary Constants</div>
              <p className="pdf-section-p" style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '1.05rem', color: 'var(--accent)' }}>
                ΔX * ΔP  ≥  ħ / 2
              </p>
              <p className="pdf-section-p">Fundamental limit of measurement certainty for wave propagation and state values.</p>
            </div>
          </div>

          <div className="pdf-sheet-footer">
            Page {page} of {totalPages} | Backbenchers Study Aids
          </div>
        </div>
      );
    }

    // Default: Notes and Important Topics
    return (
      <div className="pdf-page-sheet">
        <div className="pdf-sheet-header">
          <span className="pdf-sheet-logo"><img src="/logo.png" alt="Logo" className="pdf-logo-img" /> Notes</span>
          <span className="pdf-sheet-subcode">{code}</span>
        </div>
        <h2 className="pdf-sheet-title">{file.title}</h2>
        <div className="pdf-sheet-meta">
          <span><strong>Category:</strong> {cat === 'topics' ? 'Important Topics' : 'Lectures & Notes'}</span>
          <span><strong>Author:</strong> Academic Council</span>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-heading">1. Introduction to the Topic</div>
          <p className="pdf-section-p">
            This module covers the key principles underlying the {code} course syllabus. Make sure to review basic definitions, structural diagrams, and solved numerical problems from this chapter. Historically, at least 15-20% of exam weightage comes directly from these concepts.
          </p>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-heading">2. Detailed Discussion & Diagrams</div>
          <p className="pdf-section-p">
            When answering questions on this topic in the exam, always start with a brief introduction of the context. Provide bullet points and draw structured schematics. Let's look at the breakdown:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Step 1:</strong> Define basic variables and boundary thresholds.</li>
            <li><strong>Step 2:</strong> Write out the governing mathematical relationships.</li>
            <li><strong>Step 3:</strong> Perform steady-state analysis and solve boundary conditions.</li>
          </ul>
        </div>

        <div className="pdf-sheet-footer">
          Page {page} of {totalPages} | Backbenchers Notes Network
        </div>
      </div>
    );
  };

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            <button className="pdf-control-btn desktop-only" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <span className="pdf-page-indicator desktop-only">{zoom}%</span>
            <button className="pdf-control-btn desktop-only" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <div className="desktop-only" style={{ width: '1px', height: '20px', backgroundColor: '#475569', margin: '0 0.5rem' }}></div>
            <button className="pdf-control-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
              <ChevronLeft size={18} />
            </button>
            <span className="pdf-page-indicator">{page} / {totalPages}</span>
            <button className="pdf-control-btn" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
              <ChevronRight size={18} />
            </button>
            <div className="desktop-only" style={{ width: '1px', height: '20px', backgroundColor: '#475569', margin: '0 0.5rem' }}></div>
            <button className="pdf-control-btn" onClick={() => onDownload(file)} title="Download Document">
              <Download size={18} />
            </button>
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="pdf-body">
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.1s ease' }}>
            {renderPdfContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
