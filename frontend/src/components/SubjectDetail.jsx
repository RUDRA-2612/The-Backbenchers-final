import React, { useState } from 'react';
import { ArrowLeft, Eye, Download, FileText, Calendar, BookOpen, AlertCircle, Bookmark, HelpCircle, Flag } from 'lucide-react';

export default function SubjectDetail({ subject, materials, savedFiles = [], onBack, onViewFile, onDownloadFile, onSaveFile, onReportFile }) {
  const [activeTab, setActiveTab] = useState('papers'); // papers, notes, exam-questions
  const [activeSubTab, setActiveSubTab] = useState('mid-term'); // mid-term, end-term
  const [activeYear, setActiveYear] = useState('2025');
  const [reportModalFile, setReportModalFile] = useState(null);
  const [reportDescription, setReportDescription] = useState('');

  const handleReportSubmit = () => {
    if (reportDescription.trim() === '') return;
    onReportFile(reportModalFile, reportDescription);
    setReportModalFile(null);
    setReportDescription('');
    alert('Report submitted successfully. Thank you for your feedback!');
  };

  // Filter materials based on current subject and active tab
  const filteredMaterials = materials.filter(item => {
    if (item.subjectCode !== subject.code) return false;
    if (item.category !== activeTab) return false;
    if (activeTab === 'papers') {
      if (item.subcategory !== activeSubTab) return false;
      if (item.year && activeYear !== 'All' && item.year !== activeYear) return false;
      return true;
    }
    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'papers': return <Calendar size={22} />;
      case 'notes': return <BookOpen size={22} />;
      case 'exam-questions': return <HelpCircle size={22} />;
      default: return <FileText size={22} />;
    }
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>Back to Subjects</span>
      </button>

      <div className="subject-header-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 className="subject-header-title">{subject.name}</h2>
        <span className="subject-header-code" style={{ alignSelf: 'flex-start', fontSize: '0.9rem', padding: '0.2rem 0.6rem' }}>{subject.code}</span>
        <p style={{ color: 'var(--text-secondary)' }}>Access all syllabus resources in one place.</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
          onClick={() => setActiveTab('papers')}
        >
          Previous Year Papers & Solutions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'exam-questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('exam-questions')}
        >
          Exam Relevant Questions
        </button>
      </div>

      {/* Subtabs for Papers */}
      {activeTab === 'papers' && (
        <>
          <div className="subtabs-container">
            <button 
              className={`subtab-btn ${activeSubTab === 'mid-term' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('mid-term')}
            >
              Mid Term
            </button>
            <button 
              className={`subtab-btn ${activeSubTab === 'end-term' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('end-term')}
            >
              End Term
            </button>
          </div>

          <div className="subtabs-container" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>Year:</span>
            <button 
              className={`subtab-btn ${activeYear === '2025' ? 'active' : ''}`}
              onClick={() => setActiveYear('2025')}
            >
              2025
            </button>
            <button 
              className={`subtab-btn ${activeYear === '2024' ? 'active' : ''}`}
              onClick={() => setActiveYear('2024')}
            >
              2024
            </button>
            <button 
              className={`subtab-btn ${activeYear === 'All' ? 'active' : ''}`}
              onClick={() => setActiveYear('All')}
            >
              All
            </button>
          </div>
        </>
      )}

      {/* Resource list */}
      {filteredMaterials.length > 0 ? (
        <div className="resources-list">
          {filteredMaterials.map((file) => (
            <div key={file.id} className="resource-item">
              <div className="resource-info">
                <div className="resource-icon-box">
                  {getCategoryIcon(file.category)}
                </div>
                <div className="resource-text">
                  <h4 className="resource-title">{file.title}</h4>
                </div>
              </div>
              <div className="resource-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary btn-accent-light" 
                  onClick={() => onViewFile(file)}
                  title="View Document Online"
                  style={{ padding: '0.5rem' }}
                >
                  <Eye size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>View Online</span>
                </button>
                <button 
                  className="btn btn-secondary btn-accent-light" 
                  onClick={() => onDownloadFile(file)}
                  title="Download PDF"
                  style={{ padding: '0.5rem' }}
                >
                  <Download size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Download</span>
                </button>
                <button 
                  className="btn btn-secondary btn-accent-light" 
                  onClick={() => onSaveFile(file)}
                  title={savedFiles.some(f => f.id === file.id) ? "Remove from Saved" : "Save / Bookmark PDF"}
                  style={{ padding: '0.5rem', color: 'var(--accent)' }}
                >
                  <Bookmark size={18} fill={savedFiles.some(f => f.id === file.id) ? "var(--accent)" : "transparent"} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{savedFiles.some(f => f.id === file.id) ? "Saved" : "Save"}</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setReportModalFile(file)}
                  title="Report Issue"
                  style={{ padding: '0.5rem', color: '#ff4d4f', borderColor: 'transparent', backgroundColor: 'rgba(255, 77, 79, 0.1)' }}
                >
                  <Flag size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No study materials uploaded yet</h3>
          <p>Go to the Admin Panel if you want to upload notes or papers for this subject.</p>
        </div>
      )}

      {/* Report Modal */}
      {reportModalFile && (
        <div className="modal-overlay" onClick={() => setReportModalFile(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Report Issue</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Reporting: <strong>{reportModalFile.title}</strong>
            </p>
            <textarea 
              style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Please describe the issue (e.g. incorrect content, wrong year, unreadable pages)..."
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setReportModalFile(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: '#ff4d4f', color: '#fff' }} onClick={handleReportSubmit}>Submit Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
